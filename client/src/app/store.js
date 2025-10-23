import { configureStore } from '@reduxjs/toolkit';
import { api } from '../shared/lib/api';
import authReducer from '../features/auth/auth.slice';
import cartReducer from '../features/cart/cart.slice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    cart: cartReducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});
