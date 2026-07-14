export function getInitialCartSyncDecision({
  localItems = [],
  serverItems = [],
}) {
  const hasLocalItems = localItems.length > 0;
  const hasServerItems = serverItems.length > 0;

  return {
    shouldPushLocalItemsToServer: hasLocalItems && !hasServerItems,
    shouldReplaceLocalItemsWithServer: !hasLocalItems && hasServerItems,
  };
}
