import _ from 'lodash';
import { useContext, useEffect, useState } from 'react';
import { ClusterOperation, WizardContext, WizardStepsFormData } from '../../UniverseWizard';
import {
  CloudType,
  ClusterType,
  FlagsArray,
  FlagsObject,
  NodeDetails,
  PlacementAZ,
  PlacementRegion,
  UniverseConfigure,
  UniverseDetails
} from '../../../../helpers/dtos';
import { PlacementUI } from '../../fields/PlacementsField/PlacementsField';
import { api } from '../../../../helpers/api';
import { useWhenMounted } from '../../../../helpers/hooks';

const tagsToArray = (tags?: FlagsObject): FlagsArray => {
  const result = [];
  if (tags) {
    for (const [name, value] of Object.entries(tags)) {
      result.push({ name, value });
    }
  }
  return result;
};

const getPlacements = (formData: WizardStepsFormData): PlacementRegion[] => {
  // remove gaps from placements list
  const placements: NonNullable<PlacementUI>[] = _.cloneDeep(
    _.compact(formData.cloudConfig.placements)
  );

  // update leaders flag "isAffinitized" in placements basing on form value
  const leaders = new Set(formData.dbConfig.preferredLeaders.flatMap((item) => item.uuid));
  placements.forEach((item) => (item.isAffinitized = leaders.has(item.uuid)));

  // prepare placements basing on user selection
  const regionMap: Record<string, PlacementRegion> = {};
  placements.forEach((item) => {
    const zone: PlacementAZ = _.omit(item, [
      'parentRegionId',
      'parentRegionCode',
      'parentRegionName'
    ]);
    if (Array.isArray(regionMap[item.parentRegionId]?.azList)) {
      regionMap[item.parentRegionId].azList.push(zone);
    } else {
      regionMap[item.parentRegionId] = {
        uuid: item.parentRegionId,
        code: item.parentRegionCode,
        name: item.parentRegionName,
        azList: [zone]
      };
    }
  });

  return Object.values(regionMap);
};

// fix some skewed/missing fields in config response
const patchConfigResponse = (response: UniverseDetails, original: UniverseDetails) => {
  const clusterIndex = 0; // TODO: change to dynamic when support async clusters

  response.clusterOperation = original.clusterOperation;
  response.currentClusterType = original.currentClusterType;
  response.encryptionAtRestConfig = original.encryptionAtRestConfig;

  const userIntent = response.clusters[clusterIndex].userIntent;
  userIntent.instanceTags = original.clusters[clusterIndex].userIntent.instanceTags;
  userIntent.masterGFlags = original.clusters[clusterIndex].userIntent.masterGFlags;
  userIntent.tserverGFlags = original.clusters[clusterIndex].userIntent.tserverGFlags;
};

const checkForFullMove = (nodeDetailsSet: NodeDetails[]): boolean => {
  // remove all nodes that are:
  // - without names
  // - with "readonly" in the name (by convention it's nodes from async clusters)
  // - ones that are going to be removed
  // if there are no nodes left - it's a full move detected
  // TODO: validate "full move" detection logic and support async clusters
  const remainingNodes = nodeDetailsSet.filter(
    (node) => node.nodeName && !node.nodeName.includes('readonly') && node.state !== 'ToBeRemoved'
  );

  // if there are no remaining nodes - it's a full move
  return !remainingNodes.length;
};

export enum ConfigureUniverseStatus {
  Loading,
  Success,
  Failure,
  NoChanges
}

interface ConfigureUniverseHook {
  status: ConfigureUniverseStatus;
  isFullMove?: boolean;
  data?: UniverseConfigure;
  error?: Error;
}

export const useConfigureUniverse = (enabled: boolean): ConfigureUniverseHook => {
  const { formData, originalFormData, operation, universe } = useContext(WizardContext);
  const [status, setStatus] = useState(ConfigureUniverseStatus.Loading);
  const [isFullMove, setIsFullMove] = useState<boolean>();
  const [data, setData] = useState<UniverseConfigure>();
  const [error, setError] = useState<Error>();
  const whenMounted = useWhenMounted();

  const configureUniverse = async () => {
    try {
      switch (operation) {
        case ClusterOperation.NEW_PRIMARY: {
          // convert form data into payload suitable for the configure api call
          const configurePayload: UniverseConfigure = {
            clusterOperation: 'CREATE',
            currentClusterType: ClusterType.PRIMARY,
            rootCA: formData.securityConfig.rootCA,
            userAZSelected: false,
            communicationPorts: formData.dbConfig.communicationPorts,
            encryptionAtRestConfig: {
              key_op: formData.securityConfig.enableEncryptionAtRest ? 'ENABLE' : 'UNDEFINED'
            },
            extraDependencies: {
              installNodeExporter: formData.hiddenConfig.installNodeExporter
            },
            clusters: [
              {
                clusterType: ClusterType.PRIMARY,
                userIntent: {
                  universeName: formData.cloudConfig.universeName,
                  provider: formData.cloudConfig.provider?.uuid as string,
                  providerType: formData.cloudConfig.provider?.code as CloudType,
                  regionList: formData.cloudConfig.regionList,
                  numNodes: formData.cloudConfig.totalNodes,
                  replicationFactor: formData.cloudConfig.replicationFactor,
                  instanceType: formData.instanceConfig.instanceType as string,
                  deviceInfo: formData.instanceConfig.deviceInfo,
                  instanceTags: tagsToArray(formData.instanceConfig.instanceTags),
                  assignPublicIP: formData.instanceConfig.assignPublicIP,
                  awsArnString: formData.instanceConfig.awsArnString || '',
                  ybSoftwareVersion: formData.dbConfig.ybSoftwareVersion,
                  masterGFlags: tagsToArray(formData.dbConfig.masterGFlags),
                  tserverGFlags: tagsToArray(formData.dbConfig.tserverGFlags),
                  enableNodeToNodeEncrypt: formData.securityConfig.enableNodeToNodeEncrypt,
                  enableClientToNodeEncrypt: formData.securityConfig.enableClientToNodeEncrypt,
                  accessKeyCode: formData.hiddenConfig.accessKeyCode,
                  enableYSQL: formData.hiddenConfig.enableYSQL,
                  useTimeSync: formData.hiddenConfig.useTimeSync
                }
              }
            ]
          };

          if (
            formData.securityConfig.enableEncryptionAtRest &&
            formData.securityConfig.kmsConfig &&
            configurePayload.encryptionAtRestConfig
          ) {
            configurePayload.encryptionAtRestConfig.configUUID = formData.securityConfig.kmsConfig;
          }

          // in create mode there's no "nodeDetailsSet" yet, so make a configure call without placements to generate it
          const interimConfigure = await api.universeConfigure(configurePayload);
          patchConfigResponse(interimConfigure, configurePayload as UniverseDetails);

          // replace node placements returned by a configure call with one provided by the user
          interimConfigure.clusters[0].placementInfo = {
            cloudList: [
              {
                uuid: formData.cloudConfig.provider?.uuid as string,
                code: formData.cloudConfig.provider?.code as CloudType,
                regionList: getPlacements(formData)
              }
            ]
          };

          // make one more configure call to validate payload before submitting
          const finalPayload = await api.universeConfigure(interimConfigure);
          patchConfigResponse(finalPayload, configurePayload as UniverseDetails);

          whenMounted(() => {
            setData(finalPayload);
            setStatus(ConfigureUniverseStatus.Success);
          });
          break;
        }

        case ClusterOperation.EDIT_PRIMARY: {
          if (universe && !_.isEqual(formData, originalFormData)) {
            const payload = universe.universeDetails;
            payload.clusterOperation = 'EDIT';
            payload.currentClusterType = ClusterType.PRIMARY;
            payload.userAZSelected = formData.hiddenConfig.userAZSelected;

            // update props allowed to edit by form values
            const userIntent = payload.clusters[0].userIntent;
            userIntent.regionList = formData.cloudConfig.regionList;
            userIntent.numNodes = formData.cloudConfig.totalNodes;
            userIntent.instanceType = formData.instanceConfig.instanceType!;
            userIntent.instanceTags = tagsToArray(formData.instanceConfig.instanceTags);
            userIntent.deviceInfo = formData.instanceConfig.deviceInfo;

            // update placements and leaders
            payload.clusters[0].placementInfo.cloudList[0].regionList = getPlacements(formData);

            // submit configure call to validate the payload
            const finalPayload = await api.universeConfigure(payload);
            patchConfigResponse(finalPayload, payload);

            whenMounted(() => {
              setData(finalPayload);
              setStatus(ConfigureUniverseStatus.Success);
              setIsFullMove(checkForFullMove(finalPayload.nodeDetailsSet));
            });
          } else {
            whenMounted(() => setStatus(ConfigureUniverseStatus.NoChanges));
          }
          break;
        }
      }
    } catch (error) {
      whenMounted(() => {
        setError(error);
        setStatus(ConfigureUniverseStatus.Failure);
      });
    }
  };

  useEffect(() => {
    if (enabled) configureUniverse();
  }, [enabled]);

  return { status, isFullMove, data, error };
};
