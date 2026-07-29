// реэкспорт слайса
export { default as authReducer } from './model/auth.slice';
export * from './model/auth.slice'; // setCredentials, logout

// RTK Query
export * from './api/auth.api';

// Cross-tab session synchronization
export {
  publishAuthSessionChange,
  subscribeToAuthSessionChanges,
} from './lib/auth-session-events';

// Route guards
export { RequireAuth } from './ui/require-auth';
export { RequireRole } from './ui/require-role';

// Authentication UI
export {
  AuthenticationForm,
  AuthenticationFormFieldError,
} from './ui/authentication-form';
