import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';

import {
  authenticatedSessionCleared,
  authenticatedSessionEstablished,
  publishAuthSessionChange,
} from '@features/auth';
import { setCartItems } from '@features/cart';
import { api, authenticationSessionExpired } from '@shared/lib';

import { synchronizeCartAfterAuthentication } from '../model/synchronize-cart-after-authentication';
import type { AppListenerDispatch, RootState } from './store';

export const authCartSynchronizationListener = createListenerMiddleware<
  RootState,
  AppListenerDispatch
>();

authCartSynchronizationListener.startListening({
  matcher: isAnyOf(
    authenticatedSessionEstablished,
    authenticatedSessionCleared,
    authenticationSessionExpired,
  ),
  effect: async (authSessionAction, listenerApi) => {
    listenerApi.cancelActiveListeners();

    const isAuthenticationSessionCleared =
      authenticatedSessionCleared.match(authSessionAction);
    const isAuthenticationSessionExpired =
      authenticationSessionExpired.match(authSessionAction);

    if (isAuthenticationSessionCleared || isAuthenticationSessionExpired) {
      if (isAuthenticationSessionExpired) {
        await listenerApi.delay(0);

        if (listenerApi.signal.aborted) {
          return;
        }
      }

      listenerApi.dispatch(setCartItems([]));

      if (isAuthenticationSessionExpired) {
        listenerApi.dispatch(api.util.resetApiState());
      }

      publishAuthSessionChange(authSessionAction.payload);
      return;
    }

    await synchronizeCartAfterAuthentication({
      dispatch: listenerApi.dispatch,
      getState: listenerApi.getState,
      signal: listenerApi.signal,
    });

    if (listenerApi.signal.aborted) {
      return;
    }

    if (authenticatedSessionEstablished.match(authSessionAction)) {
      publishAuthSessionChange(authSessionAction.payload);
    }
  },
});
