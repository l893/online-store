import { Button as MaterialButton } from '@mui/material';

export const Button = ({
  type = 'submit',
  variant = 'contained',
  color = 'warning',
  ...props
}) => {
  return (
    <MaterialButton type={type} variant={variant} color={color} {...props} />
  );
};
