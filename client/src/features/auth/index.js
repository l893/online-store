// реэкспорт слайса
export { default as authReducer } from './model/auth.slice';
export * from './model/auth.slice'; // setCredentials, logout

// RTK Query
export * from './auth.api';

// гардёры
export { RequireAuth } from './require-auth';
export { RequireRole } from './require-role';
