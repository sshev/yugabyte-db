import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { CloudConfigFormValue } from '../../steps/cloud/CloudConfig';
import { ControllerRenderProps } from '../../../../helpers/types';
import {
  RadioButtonGroup,
  RadioButtonOption
} from '../../../../uikit/RadioButtonGroup/RadioButtonGroup';

interface ReplicationFactorFieldProps {
  disabled: boolean;
}

const OPTIONS: RadioButtonOption<number>[] = [
  { value: 1, label: '1' },
  { value: 3, label: '3' },
  { value: 5, label: '5' },
];

export const ReplicationFactorField: FC<ReplicationFactorFieldProps> = ({ disabled }) => {
  const { control } = useFormContext<CloudConfigFormValue>();

  return (
    <Controller
      control={control}
      name="replicationFactor"
      render={({ value, onChange }: ControllerRenderProps<number>) => (
        <RadioButtonGroup<number>
          value={value}
          onChange={onChange}
          options={OPTIONS}
          disabled={disabled}
        />
      )}
    />
  );
};
