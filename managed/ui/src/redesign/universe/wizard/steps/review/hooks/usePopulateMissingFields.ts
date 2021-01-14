import _ from 'lodash';
import { useQuery } from 'react-query';
import { Dispatch, useContext } from 'react';
import { WizardAction, WizardContext } from '../../../UniverseWizard';
import { api, QUERY_KEY } from '../../../../../helpers/api';
import { sortVersionStrings } from '../../../../../../utils/ObjectUtils';
import { DEFAULT_INSTANCE_TYPES } from '../../../fields/InstanceTypeField/InstanceTypeField';
import { getDeviceInfoFromInstance } from '../../../fields/DeviceInfoField/DeviceInfoField';

interface PopulateMissingFieldsHook {
  isLoadingMissingFields: boolean;
  isMissingFieldsPopulated: boolean;
}

// user could jump between steps and open the review step with some required fields missing
// therefore populate missing required fields with default/preset values
export const usePopulateMissingFields = (
  dispatch: Dispatch<WizardAction>
): PopulateMissingFieldsHook => {
  const { formData } = useContext(WizardContext);

  // load db versions and populate ybSoftwareVersion with the first available item
  const { isLoading: isDBVersionLoading } = useQuery(QUERY_KEY.getDBVersions, api.getDBVersions, {
    enabled: !formData.dbConfig.ybSoftwareVersion,
    onSuccess: (data) => {
      if (_.isEmpty(data)) {
        console.error('Failed to load Yugabyte DB versions');
      } else {
        dispatch({
          type: 'update_form_data',
          payload: {
            dbConfig: {
              ...formData.dbConfig,
              ybSoftwareVersion: sortVersionStrings(data)[0]
            }
          }
        });
      }
    }
  });

  // load instance type for a given provider and populate instanceType and deviceInfo
  const { isLoading: isInstanceTypeLoading } = useQuery(
    [QUERY_KEY.getInstanceTypes, formData.cloudConfig.provider?.uuid],
    api.getInstanceTypes,
    {
      enabled: !formData.instanceConfig.instanceType && !!formData.cloudConfig.provider?.uuid,
      onSuccess: (data) => {
        const defaultInstanceType = DEFAULT_INSTANCE_TYPES[formData.cloudConfig.provider!.code];
        const instance = defaultInstanceType
          ? _.find(data, { instanceTypeCode: defaultInstanceType })
          : (data || [])[0];

        if (instance) {
          dispatch({
            type: 'update_form_data',
            payload: {
              instanceConfig: {
                ...formData.instanceConfig,
                instanceType: instance.instanceTypeCode,
                deviceInfo: getDeviceInfoFromInstance(instance)
              }
            }
          });
        } else {
          console.error(
            `Failed to load instance types for the provider ${formData.cloudConfig.provider?.uuid}`
          );
        }
      }
    }
  );

  // get access key  for a given provider and take first item from the array (currently there's single access key per provider)
  const { isLoading: isAccessKeyLoading } = useQuery(
    [QUERY_KEY.getAccessKeys, formData.cloudConfig.provider?.uuid],
    api.getAccessKeys,
    {
      enabled: !formData.hiddenConfig.accessKeyCode && !!formData.cloudConfig.provider?.uuid,
      onSuccess: (data) => {
        if (_.isEmpty(data)) {
          console.error(
            `Failed to load access key for the provider ${formData.cloudConfig.provider?.uuid}`
          );
        } else {
          dispatch({
            type: 'update_form_data',
            payload: {
              hiddenConfig: {
                ...formData.hiddenConfig,
                accessKeyCode: data[0].idKey.keyCode
              }
            }
          });
        }
      }
    }
  );

  return {
    isLoadingMissingFields: isDBVersionLoading || isInstanceTypeLoading || isAccessKeyLoading,
    isMissingFieldsPopulated:
      !!formData.dbConfig.ybSoftwareVersion &&
      !!formData.instanceConfig.instanceType &&
      !!formData.hiddenConfig.accessKeyCode
  };
};
