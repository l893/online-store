import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { api } from '../../../shared/lib';
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
    const currentCartItem = cartItems.find(
      (cartItem) => cartItem.productId === productId,
    );

    if (!currentCartItem) {
      return;
    }

    const availableStock = Math.max(0, Number(currentCartItem.stock) || 0);

    if (availableStock === 0) {
      return;
    }

    const normalizedQuantity = Math.min(
      availableStock,
      Math.max(1, Number(quantity) || 1),
    );

    if (currentCartItem.qty === normalizedQuantity) {
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
    } catch (error) {
      const isInsufficientStockError =
        error?.data?.code === 'INSUFFICIENT_STOCK';
      const availableStock = Number(error?.data?.availableStock);
      const hasValidAvailableStock =
        Number.isFinite(availableStock) && availableStock >= 0;

      const restoredCartItems =
        isInsufficientStockError && hasValidAvailableStock
          ? previousCartItems.map((previousCartItem) =>
              previousCartItem.productId === productId
                ? {
                    ...previousCartItem,
                    stock: availableStock,
                  }
                : previousCartItem,
            )
          : previousCartItems;

      dispatch(setCartItems(restoredCartItems));

      if (isInsufficientStockError) {
        dispatch(api.util.invalidateTags(['Product']));
      }

      setCartActionDialog({
        title: isInsufficientStockError
          ? 'Недостаточно товара'
          : 'Не удалось изменить количество',
        description:
          isInsufficientStockError && hasValidAvailableStock
            ? `Доступно: ${availableStock}. Корзина восстановлена.`
            : 'Корзина восстановлена. Попробуйте повторить позже.',
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
