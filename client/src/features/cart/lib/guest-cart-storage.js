const GUEST_CART_STORAGE_KEY = 'guestCart';
const GUEST_CART_STORAGE_VERSION = 1;

function normalizeStoredGuestCartItem(storedCartItem) {
  if (
    !storedCartItem ||
    typeof storedCartItem.productId !== 'string' ||
    !storedCartItem.productId
  ) {
    return null;
  }

  return {
    productId: storedCartItem.productId,
    title:
      typeof storedCartItem.title === 'string'
        ? storedCartItem.title
        : 'Неизвестный товар',
    price: Math.max(0, Number(storedCartItem.price) || 0),
    image:
      typeof storedCartItem.image === 'string'
        ? storedCartItem.image
        : undefined,
    stock: Math.max(0, Math.floor(Number(storedCartItem.stock) || 0)),
    qty: Math.max(1, Math.floor(Number(storedCartItem.qty) || 1)),
  };
}

export function clearGuestCartItems() {
  try {
    localStorage.removeItem(GUEST_CART_STORAGE_KEY);
  } catch {
    // Storage может быть недоступен из-за настроек браузера.
  }
}

export function loadGuestCartItems() {
  try {
    const serializedGuestCart = localStorage.getItem(GUEST_CART_STORAGE_KEY);

    if (!serializedGuestCart) {
      return [];
    }

    const storedGuestCart = JSON.parse(serializedGuestCart);

    if (
      storedGuestCart?.version !== GUEST_CART_STORAGE_VERSION ||
      !Array.isArray(storedGuestCart.items)
    ) {
      clearGuestCartItems();
      return [];
    }

    return storedGuestCart.items
      .map(normalizeStoredGuestCartItem)
      .filter(Boolean);
  } catch {
    clearGuestCartItems();
    return [];
  }
}

export function saveGuestCartItems(guestCartItems) {
  try {
    if (!Array.isArray(guestCartItems) || guestCartItems.length === 0) {
      clearGuestCartItems();
      return;
    }

    localStorage.setItem(
      GUEST_CART_STORAGE_KEY,
      JSON.stringify({
        version: GUEST_CART_STORAGE_VERSION,
        items: guestCartItems,
      }),
    );
  } catch {
    // Ошибка записи не должна ломать работу корзины.
  }
}
