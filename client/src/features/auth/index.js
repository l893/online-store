// реэкспорт слайса
export { default as authReducer } from './model/auth.slice';
export * from './model/auth.slice'; // setCredentials, logout

// RTK Query
export * from './auth.api';

// Route guards
export { RequireAuth } from './ui/require-auth';
export { RequireRole } from './ui/require-role';
