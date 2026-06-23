import { Button as MuiButton } from '@mui/material';

export const Button = ({
  variant = 'contained',
  color = 'warning',
  ...props
}) => {
  return <MuiButton variant={variant} color={color} {...props} />;
};
