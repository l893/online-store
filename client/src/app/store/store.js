import { configureStore } from '@reduxjs/toolkit';
import { api } from '../../shared/lib/api';
import { authReducer } from '../../features/auth';
import { cartReducer } from '../../features/cart';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
