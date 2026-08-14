import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
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

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  cart: cartReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export type AppListenerDispatch = ThunkDispatch<
  RootState,
  unknown,
  UnknownAction
>;

const preloadedGuestCartItems = loadGuestCartItems();

const preloadedState = {
  cart: {
    items: preloadedGuestCartItems,
  },
} satisfies Partial<RootState>;

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(authCartSynchronizationListener.middleware)
      .concat(api.middleware),
});

export type AppStore = typeof store;
export type AppDispatch = AppStore['dispatch'];

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
