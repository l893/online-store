export function getCartTotals(cartItems = []) {
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
