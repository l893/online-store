import { TextField } from '@mui/material';

export const Input = ({
  className = '',
  size = 'small',
  variant = 'outlined',
  fullWidth = true,
  inputProps,
  slotProps,
  ...props
}) => {
  const htmlInputProps = {
    ...inputProps,
    ...slotProps?.htmlInput,
    className: [
      inputProps?.className,
      slotProps?.htmlInput?.className,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  };

  return (
    <TextField
      className={className}
      size={size}
      variant={variant}
      fullWidth={fullWidth}
      slotProps={{
        ...slotProps,
        htmlInput: htmlInputProps,
      }}
      {...props}
    />
  );
};
