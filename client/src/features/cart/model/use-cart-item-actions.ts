import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { cartApi, useRemoveItemFromCartMutation } from '../api/cart.api';
import type { ReplaceCartTrigger } from '../api/cart.api';
import { getCartMutationErrorDetails } from '../lib/get-cart-mutation-error-details';
import {
  changeCartItemQuantity,
  removeCartItem,
  setCartItems,
} from './cart.slice';
import type { CartItem } from './cart.types';
import type { CartOrchestrationDispatch } from './cart-orchestration.types';

interface CartActionDialog {
  readonly title: string;
  readonly description: string;
}

interface UseCartItemActionsOptions {
  readonly isAuthenticated: boolean;
  readonly cartItems?: CartItem[];
  readonly replaceCart: ReplaceCartTrigger;
}

interface UseCartItemActionsResult {
  readonly cartActionDialog: CartActionDialog | null;
  readonly handleCartItemQuantityChange: (
    productId: string,
    quantity: number,
  ) => Promise<void>;
  readonly handleCartItemRemove: (productId: string) => Promise<void>;
  readonly handleCartActionDialogClose: () => void;
}

export function useCartItemActions({
  isAuthenticated,
  cartItems = [],
  replaceCart,
}: UseCartItemActionsOptions): UseCartItemActionsResult {
  const dispatch = useDispatch<CartOrchestrationDispatch>();
  const [cartActionDialog, setCartActionDialog] =
    useState<CartActionDialog | null>(null);
  const [removeItemFromCart] = useRemoveItemFromCartMutation();

  async function handleCartItemQuantityChange(
    productId: string,
    quantity: number,
  ): Promise<void> {
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
    } catch (error: unknown) {
      const { isInsufficientStockError, availableStock } =
        getCartMutationErrorDetails(error);
      const hasValidAvailableStock = availableStock !== null;

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
        dispatch(cartApi.util.invalidateTags(['Product']));
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

  async function handleCartItemRemove(productId: string): Promise<void> {
    const previousCartItems = cartItems;

    const serverCartCachePatch = isAuthenticated
      ? dispatch(
          cartApi.util.updateQueryData(
            'getCart',
            undefined,
            (cachedCartResponse) => {
              if (!Array.isArray(cachedCartResponse.items)) {
                return;
              }

              cachedCartResponse.items = cachedCartResponse.items.filter(
                (cartItem) => cartItem.productId !== productId,
              );
            },
          ),
        )
      : null;

    dispatch(removeCartItem(productId));

    if (!isAuthenticated) {
      return;
    }

    try {
      await removeItemFromCart(productId).unwrap();
    } catch {
      serverCartCachePatch?.undo();
      dispatch(setCartItems(previousCartItems));

      setCartActionDialog({
        title: 'Не удалось удалить товар',
        description: 'Корзина восстановлена. Попробуйте повторить позже.',
      });
    }
  }

  function handleCartActionDialogClose(): void {
    setCartActionDialog(null);
  }

  return {
    cartActionDialog,
    handleCartItemQuantityChange,
    handleCartItemRemove,
    handleCartActionDialogClose,
  };
}
