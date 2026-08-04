import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import {
  authenticatedSessionCleared,
  authenticatedSessionEstablished,
  publishAuthSessionChange,
} from '../../features/auth';
import { setCartItems } from '../../features/cart';
import { api, authenticationSessionExpired } from '../../shared/lib';
import { synchronizeCartAfterAuthentication } from '../model/synchronize-cart-after-authentication';

export const authCartSynchronizationListener = createListenerMiddleware();

authCartSynchronizationListener.startListening({
  matcher: isAnyOf(
    authenticatedSessionEstablished,
    authenticatedSessionCleared,
    authenticationSessionExpired,
  ),
  effect: async (authSessionAction, listenerApi) => {
    listenerApi.cancelActiveListeners();

    if (
      authenticatedSessionCleared.match(authSessionAction) ||
      authenticationSessionExpired.match(authSessionAction)
    ) {
      listenerApi.dispatch(setCartItems([]));

      if (authenticationSessionExpired.match(authSessionAction)) {
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

    publishAuthSessionChange(authSessionAction.payload);
  },
});
