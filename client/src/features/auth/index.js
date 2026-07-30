// Store
export { default as authReducer } from './model/auth.slice';

// RTK Query
export {
  useRegisterMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
} from './api/auth.api';

// Cross-tab session synchronization
export { subscribeToAuthSessionChanges } from './lib/auth-session-events';

// Route guards
export { RequireAuth } from './ui/require-auth';
export { RequireRole } from './ui/require-role';

// Authentication UI
export {
  AuthenticationForm,
  AuthenticationFormFieldError,
} from './ui/authentication-form';
