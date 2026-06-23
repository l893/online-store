import { Button as MuiButton } from '@mui/material';

export const Button = ({
  type = 'submit',
  variant = 'contained',
  color = 'warning',
  ...props
}) => {
  return <MuiButton type={type} variant={variant} color={color} {...props} />;
};
