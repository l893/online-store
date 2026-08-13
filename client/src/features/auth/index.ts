// Store
export { default as authReducer } from './model/auth.slice';
export { selectAuthenticatedUser } from './model/auth.slice';
export type { AuthenticatedUser } from './model/auth.types';

// RTK Query
export {
  useRegisterMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
} from './api/auth.api';
export type { LoginRequest, RegisterRequest } from './api/auth.types';

// Cross-tab session synchronization
export {
  publishAuthSessionChange,
  subscribeToAuthSessionChanges,
} from './lib/auth-session-events';

// Authentication input limits
export {
  AUTH_EMAIL_MAX_LENGTH,
  AUTH_NAME_MAX_LENGTH,
  AUTH_PASSWORD_MAX_BYTE_LENGTH,
  isAuthenticationPasswordWithinByteLengthLimit,
} from './lib/auth-input-limits';

// Authenticated session events
export {
  authenticatedSessionCleared,
  authenticatedSessionEstablished,
} from './model/auth-session.events';

// Route guards
export { RequireAuth } from './ui/require-auth';
export { RequireRole } from './ui/require-role';

// Authentication UI
export {
  AuthenticationForm,
  AuthenticationFormFieldError,
} from './ui/authentication-form';
