export const AUTH_EMAIL_MAX_LENGTH = 254;
export const AUTH_NAME_MAX_LENGTH = 100;
export const AUTH_PASSWORD_MAX_BYTE_LENGTH = 72;

export function isAuthenticationPasswordWithinByteLengthLimit(passwordValue) {
  if (!passwordValue) {
    return true;
  }

  return (
    new TextEncoder().encode(passwordValue).length <=
    AUTH_PASSWORD_MAX_BYTE_LENGTH
  );
}
