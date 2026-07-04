import { TextField } from '@mui/material';

export const Input = ({
  className = '',
  size = 'small',
  variant = 'outlined',
  fullWidth = true,
  inputProps,
  slotProps,
  placeholder,
  label,
  ...props
}) => {
  const ariaLabel =
    inputProps?.['aria-label'] ||
    slotProps?.htmlInput?.['aria-label'] ||
    label ||
    placeholder;

  const htmlInputProps = {
    ...inputProps,
    ...slotProps?.htmlInput,
    ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
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
      label={label}
      placeholder={placeholder}
      slotProps={{
        ...slotProps,
        htmlInput: htmlInputProps,
      }}
      {...props}
    />
  );
};
