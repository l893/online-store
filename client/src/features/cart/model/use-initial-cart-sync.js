import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { getInitialCartSyncDecision } from '../lib/get-initial-cart-sync-decision';
import { setAll } from './cart.slice';

export function useInitialCartSync({
  isAuthenticated,
  localItems = [],
  serverCart,
  replaceCart,
}) {
  const dispatch = useDispatch();
  const hasInitialSyncStartedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      hasInitialSyncStartedRef.current = false;
      return;
    }

    if (!serverCart || hasInitialSyncStartedRef.current) {
      return;
    }

    hasInitialSyncStartedRef.current = true;

    const serverItems = Array.isArray(serverCart.items) ? serverCart.items : [];

    const { shouldPushLocalItemsToServer, shouldReplaceLocalItemsWithServer } =
      getInitialCartSyncDecision({
        localItems,
        serverItems,
      });

    if (shouldPushLocalItemsToServer) {
      replaceCart(localItems)
        .unwrap()
        .catch(() => {});
      return;
    }

    if (shouldReplaceLocalItemsWithServer) {
      dispatch(setAll(serverItems));
    }
  }, [dispatch, isAuthenticated, localItems, replaceCart, serverCart]);
}
