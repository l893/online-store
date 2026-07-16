export function mergeCartItems({ serverItems = [], localItems = [] }) {
  const mergedItemsByProductId = new Map();

  for (const cartItem of [...serverItems, ...localItems]) {
    if (!cartItem?.productId) {
      continue;
    }

    const cartItemQuantity = Math.max(1, Number(cartItem.qty) || 1);

    const existingCartItem = mergedItemsByProductId.get(cartItem.productId);

    if (!existingCartItem) {
      mergedItemsByProductId.set(cartItem.productId, {
        ...cartItem,
        qty: cartItemQuantity,
      });
      continue;
    }

    mergedItemsByProductId.set(cartItem.productId, {
      ...existingCartItem,
      ...cartItem,
      qty: existingCartItem.qty + cartItemQuantity,
    });
  }

  return Array.from(mergedItemsByProductId.values());
}
