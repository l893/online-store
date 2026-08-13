import type { InputHTMLAttributes } from 'react';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

interface InputCompatibilityProps {
  readonly inputProps?: InputHTMLAttributes<HTMLInputElement>;
  readonly label?: string;
}

export type InputProps = TextFieldProps & InputCompatibilityProps;

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
}: InputProps) => {
  const htmlInputSlotProps =
    typeof slotProps?.htmlInput === 'function'
      ? undefined
      : slotProps?.htmlInput;

  const ariaLabel =
    inputProps?.['aria-label'] ||
    htmlInputSlotProps?.['aria-label'] ||
    label ||
    placeholder;

  const htmlInputProps = {
    ...inputProps,
    ...htmlInputSlotProps,
    ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
    className: [inputProps?.className, htmlInputSlotProps?.className, className]
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
