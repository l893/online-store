import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from '@shared/lib';
import { authReducer } from '@features/auth';
import {
  cartReducer,
  clearGuestCartItems,
  loadGuestCartItems,
  saveGuestCartItems,
} from '@features/cart';
import { authCartSynchronizationListener } from './auth-cart-synchronization-listener';

const preloadedGuestCartItems = loadGuestCartItems();

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    cart: cartReducer,
  },
  preloadedState: {
    cart: {
      items: preloadedGuestCartItems,
    },
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(authCartSynchronizationListener.middleware)
      .concat(api.middleware),
});

let previousCartItems = store.getState().cart.items;
let wasAuthenticated = Boolean(store.getState().auth.user);

store.subscribe(() => {
  const state = store.getState();
  const cartItems = state.cart.items;
  const isAuthenticated = Boolean(state.auth.user);

  if (isAuthenticated || wasAuthenticated) {
    clearGuestCartItems();
  } else if (cartItems !== previousCartItems) {
    saveGuestCartItems(cartItems);
  }

  previousCartItems = cartItems;
  wasAuthenticated = isAuthenticated;
});

setupListeners(store.dispatch);
