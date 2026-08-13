import type { CartItem, CartTotals } from '../model/cart.types';

export function getCartTotals(cartItems: readonly CartItem[] = []): CartTotals {
  let totalQuantity = 0;
  let totalSum = 0;

  for (const cartItem of cartItems) {
    totalQuantity += cartItem.qty;
    totalSum += cartItem.qty * cartItem.price;
  }

  return {
    totalQuantity,
    totalSum,
  };
}
