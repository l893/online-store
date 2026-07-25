import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRemoveItemFromCartMutation } from '../api/cart.api';
import {
  changeCartItemQuantity,
  removeCartItem,
  setCartItems,
} from './cart.slice';

export function useCartItemActions({
  isAuthenticated,
  cartItems = [],
  replaceCart,
}) {
  const dispatch = useDispatch();
  const [cartActionDialog, setCartActionDialog] = useState(null);
  const [removeItemFromCart] = useRemoveItemFromCartMutation();

  async function handleCartItemQuantityChange(productId, quantity) {
    const normalizedQuantity = Math.max(1, Number(quantity) || 1);
    const currentCartItem = cartItems.find(
      (cartItem) => cartItem.productId === productId,
    );

    if (!currentCartItem || currentCartItem.qty === normalizedQuantity) {
      return;
    }

    const previousCartItems = cartItems;

    dispatch(
      changeCartItemQuantity({
        productId,
        qty: normalizedQuantity,
      }),
    );

    if (!isAuthenticated) {
      return;
    }

    const nextCartItems = cartItems.map((cartItem) =>
      cartItem.productId === productId
        ? {
            ...cartItem,
            qty: normalizedQuantity,
          }
        : cartItem,
    );

    try {
      await replaceCart(nextCartItems).unwrap();
    } catch {
      dispatch(setCartItems(previousCartItems));

      setCartActionDialog({
        title: 'Не удалось изменить количество',
        description: 'Корзина восстановлена. Попробуйте повторить позже.',
      });
    }
  }

  async function handleCartItemRemove(productId) {
    const previousCartItems = cartItems;

    dispatch(removeCartItem(productId));

    if (!isAuthenticated) {
      return;
    }

    try {
      await removeItemFromCart(productId).unwrap();
    } catch {
      dispatch(setCartItems(previousCartItems));

      setCartActionDialog({
        title: 'Не удалось удалить товар',
        description: 'Корзина восстановлена. Попробуйте повторить позже.',
      });
    }
  }

  function handleCartActionDialogClose() {
    setCartActionDialog(null);
  }

  return {
    cartActionDialog,
    handleCartItemQuantityChange,
    handleCartItemRemove,
    handleCartActionDialogClose,
  };
}
