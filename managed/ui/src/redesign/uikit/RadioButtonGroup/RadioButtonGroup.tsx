import clsx from 'clsx';
import React, { ReactNode } from 'react';
import './RadioButtonGroup.scss';

export interface RadioButtonOption<T> {
  value: T;
  label: ReactNode;
}

interface RadioButtonGroupProps<T> {
  options: RadioButtonOption<T>[];
  value: T;
  onChange(value: T): void;
  disabled?: boolean;
}

export const RadioButtonGroup = <T extends {}>({
  options,
  value,
  onChange,
  disabled
}: RadioButtonGroupProps<T>) => {
  const onClick = (newValue: T) => {
    if (!disabled && newValue !== value) onChange(newValue);
  };

  return (
    <div className="yb-uikit-rb-group">
      {options.map((option) => (
        <div
          key={`option-${option.value}`}
          className={clsx(
            'yb-uikit-rb-group__item',
            value === option.value && 'yb-uikit-rb-group__item--selected',
            disabled && 'yb-uikit-rb-group__item--disabled'
          )}
          onClick={() => onClick(option.value)}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
};
