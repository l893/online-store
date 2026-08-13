import type { CartItem } from '../model/cart.types';

interface InitialCartSyncDecisionOptions {
  readonly localCartItems?: readonly CartItem[];
  readonly serverCartItems?: readonly CartItem[];
}

interface InitialCartSyncDecision {
  readonly shouldPushLocalItemsToServer: boolean;
  readonly shouldReplaceLocalItemsWithServer: boolean;
}

export function getInitialCartSyncDecision({
  localCartItems = [],
  serverCartItems = [],
}: InitialCartSyncDecisionOptions): InitialCartSyncDecision {
  const hasLocalCartItems = localCartItems.length > 0;
  const hasServerCartItems = serverCartItems.length > 0;

  return {
    shouldPushLocalItemsToServer: hasLocalCartItems && !hasServerCartItems,
    shouldReplaceLocalItemsWithServer: !hasLocalCartItems && hasServerCartItems,
  };
}
