import clsx from 'clsx';
import React, { FC } from 'react';
import './ReplicationFactor.scss';

interface ReplicationFactorProps {
  options: number[];
  value: number;
  onChange(value: number): void;
  disabled?: boolean;
}

export const ReplicationFactor: FC<ReplicationFactorProps> = ({
  options,
  value,
  onChange,
  disabled
}) => {
  const onClick = (newValue: number) => {
    if (!disabled && newValue !== value) onChange(newValue);
  };

  return (
    <div className="replication-factor">
      {options.map((option) => (
        <div
          key={option}
          className={clsx(
            'replication-factor__item',
            value === option && 'replication-factor__item--selected',
            disabled && 'replication-factor__item--disabled'
          )}
          onClick={() => onClick(option)}
        >
          {option}
        </div>
      ))}
    </div>
  );
};
