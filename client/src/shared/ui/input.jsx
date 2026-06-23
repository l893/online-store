import { TextField } from '@mui/material';

export const Input = ({
  className = '',
  size = 'small',
  variant = 'outlined',
  fullWidth = true,
  inputProps,
  ...props
}) => {
  const mergedInputProps = {
    ...inputProps,
    className: inputProps?.className
      ? `${inputProps.className} ${className}`
      : className,
  };

  return (
    <TextField
      className={className}
      size={size}
      variant={variant}
      fullWidth={fullWidth}
      inputProps={mergedInputProps}
      {...props}
    />
  );
};
