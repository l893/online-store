import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import {
  authenticatedSessionCleared,
  authenticatedSessionEstablished,
  publishAuthSessionChange,
} from '../../features/auth';
import { setCartItems } from '../../features/cart';
import { synchronizeCartAfterAuthentication } from '../model/synchronize-cart-after-authentication';

export const authCartSynchronizationListener = createListenerMiddleware();

authCartSynchronizationListener.startListening({
  matcher: isAnyOf(
    authenticatedSessionEstablished,
    authenticatedSessionCleared,
  ),
  effect: async (authSessionAction, listenerApi) => {
    listenerApi.cancelActiveListeners();

    if (authenticatedSessionCleared.match(authSessionAction)) {
      listenerApi.dispatch(setCartItems([]));
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
