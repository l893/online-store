import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import type { ReplaceCartTrigger } from '../api/cart.api';
import type { CartResponse } from '../api/cart.types';
import { getInitialCartSyncDecision } from '../lib/get-initial-cart-sync-decision';
import { setCartItems } from './cart.slice';
import type { CartItem } from './cart.types';

interface UseInitialCartSyncOptions {
  readonly isAuthenticated: boolean;
  readonly localCartItems?: readonly CartItem[];
  readonly serverCart?: CartResponse;
  readonly replaceCart: ReplaceCartTrigger;
}

export function useInitialCartSync({
  isAuthenticated,
  localCartItems = [],
  serverCart,
  replaceCart,
}: UseInitialCartSyncOptions): void {
  const dispatch = useDispatch();
  const hasInitialCartSyncStartedReference = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      hasInitialCartSyncStartedReference.current = false;
      return;
    }

    if (!serverCart || hasInitialCartSyncStartedReference.current) {
      return;
    }

    hasInitialCartSyncStartedReference.current = true;

    const serverCartItems = Array.isArray(serverCart.items)
      ? serverCart.items
      : [];

    const { shouldPushLocalItemsToServer, shouldReplaceLocalItemsWithServer } =
      getInitialCartSyncDecision({
        localCartItems,
        serverCartItems,
      });

    if (shouldPushLocalItemsToServer) {
      replaceCart(localCartItems)
        .unwrap()
        .catch(() => {});
      return;
    }

    if (shouldReplaceLocalItemsWithServer) {
      dispatch(setCartItems(serverCartItems));
    }
  }, [dispatch, isAuthenticated, localCartItems, replaceCart, serverCart]);
}
