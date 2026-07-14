import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAll } from '../cart.slice';
import { getInitialCartSyncDecision } from '../lib/get-initial-cart-sync-decision';

export function useInitialCartSync({
  isAuthenticated,
  localItems = [],
  serverCart,
  replaceCart,
}) {
  const dispatch = useDispatch();
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !serverCart || isInitialSyncDone) {
      return;
    }

    const serverItems = Array.isArray(serverCart.items) ? serverCart.items : [];

    const { shouldPushLocalItemsToServer, shouldReplaceLocalItemsWithServer } =
      getInitialCartSyncDecision({
        localItems,
        serverItems,
      });

    if (shouldPushLocalItemsToServer) {
      replaceCart(localItems).catch(() => {});
      return;
    }

    if (shouldReplaceLocalItemsWithServer) {
      dispatch(setAll(serverItems));
    }

    setIsInitialSyncDone(true);
  }, [
    dispatch,
    isAuthenticated,
    isInitialSyncDone,
    localItems,
    replaceCart,
    serverCart,
  ]);
}
