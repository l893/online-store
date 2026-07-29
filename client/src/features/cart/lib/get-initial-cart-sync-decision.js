export function getInitialCartSyncDecision({
  localCartItems = [],
  serverCartItems = [],
}) {
  const hasLocalCartItems = localCartItems.length > 0;
  const hasServerCartItems = serverCartItems.length > 0;

  return {
    shouldPushLocalItemsToServer: hasLocalCartItems && !hasServerCartItems,
    shouldReplaceLocalItemsWithServer: !hasLocalCartItems && hasServerCartItems,
  };
}
