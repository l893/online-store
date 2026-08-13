import { Button as MaterialButton } from '@mui/material';
import type { ButtonProps as MaterialButtonProps } from '@mui/material';

export type ButtonProps = MaterialButtonProps;

export const Button = ({
  type = 'submit',
  variant = 'contained',
  color = 'warning',
  ...props
}: ButtonProps) => {
  return (
    <MaterialButton type={type} variant={variant} color={color} {...props} />
  );
};
