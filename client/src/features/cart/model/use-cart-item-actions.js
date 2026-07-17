import { useDispatch } from 'react-redux';
import { useRemoveItemFromCartMutation } from '../cart.api';
import { changeQty, removeItem } from './cart.slice';

export function useCartItemActions({
  isAuthenticated,
  cartItems = [],
  replaceCart,
}) {
  const dispatch = useDispatch();
  const [removeItemFromCart] = useRemoveItemFromCartMutation();

  function handleCartItemQuantityChange(productId, quantity) {
    dispatch(
      changeQty({
        productId,
        qty: quantity,
      }),
    );

    if (!isAuthenticated) {
      return;
    }

    const nextCartItems = cartItems.map((cartItem) =>
      cartItem.productId === productId
        ? {
            ...cartItem,
            qty: quantity,
          }
        : cartItem,
    );

    replaceCart(nextCartItems).catch(() => {});
  }

  function handleCartItemRemove(productId) {
    dispatch(removeItem(productId));

    if (!isAuthenticated) {
      return;
    }

    removeItemFromCart(productId).catch(() => {});
  }

  return {
    handleCartItemQuantityChange,
    handleCartItemRemove,
  };
}
