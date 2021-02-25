import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { CloudConfigFormValue } from '../../steps/cloud/CloudConfig';
import { ControllerRenderProps } from '../../../../helpers/types';
import { I18n } from '../../../../uikit/I18n/I18n';
import {
  RadioButtonGroup,
  RadioButtonOption
} from '../../../../uikit/RadioButtonGroup/RadioButtonGroup';
import './ReplicaPlacementToggleField.scss';

interface ReplicaPlacementToggleFieldProps {
  disabled: boolean;
}

const OPTIONS: RadioButtonOption<boolean>[] = [
  { value: false, label: <I18n>Manual</I18n> },
  { value: true, label: <I18n>Auto</I18n> }
];

export const ReplicaPlacementToggleField: FC<ReplicaPlacementToggleFieldProps> = ({ disabled }) => {
  const { control } = useFormContext<CloudConfigFormValue>();

  return (
    <Controller
      control={control}
      name="autoPlacement"
      render={({ value, onChange }: ControllerRenderProps<boolean>) => (
        <RadioButtonGroup<boolean>
          value={value}
          onChange={onChange}
          options={OPTIONS}
          disabled={disabled}
        />
      )}
    />
  );
};
