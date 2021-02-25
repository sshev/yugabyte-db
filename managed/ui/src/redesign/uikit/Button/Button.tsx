import clsx from 'clsx';
import _ from 'lodash';
import React, { FC } from 'react';
import { Button as BootstrapButton, ButtonProps as BootstrapButtonProps } from 'react-bootstrap';
import './Button.scss';

interface CustomButtonProps {
  cta?: boolean;
}

type ButtonProps = BootstrapButtonProps & CustomButtonProps;

export const Button: FC<ButtonProps> = ({ cta, children, ...props }) => {
  // omit explicitly applied props
  const rest = _.omit(props, ['cta', 'className', 'children']);

  return (
    <BootstrapButton
      bsClass={clsx('yb-uikit-button', props.className, 'btn', cta && 'btn-orange')}
      {...rest}
    >
      {children}
    </BootstrapButton>
  );
};
