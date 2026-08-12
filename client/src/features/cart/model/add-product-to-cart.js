import { api } from '@shared/lib';
import { cartApi } from '../api/cart.api';
import { addCartItem, setCartItems } from './cart.slice';

export function addProductToCart({ cartItem, isAuthenticated }) {
  return async (dispatch, getState) => {
    const availableStock = Math.max(0, Number(cartItem.stock) || 0);
    const previousCartItems = getState().cart.items;
    const existingCartItem = previousCartItems.find(
      (currentCartItem) => currentCartItem.productId === cartItem.productId,
    );
    const currentQuantity = existingCartItem?.qty || 0;
    const requestedQuantity = Math.max(1, Number(cartItem.qty) || 1);
    const remainingAvailableQuantity = Math.max(
      0,
      availableStock - currentQuantity,
    );
    const quantityToAdd = Math.min(
      requestedQuantity,
      remainingAvailableQuantity,
    );

    if (quantityToAdd === 0) {
      return;
    }

    dispatch(
      addCartItem({
        ...cartItem,
        stock: availableStock,
        qty: quantityToAdd,
      }),
    );

    if (!isAuthenticated) {
      return;
    }

    const updatedCartItems = getState().cart.items;

    try {
      await dispatch(
        cartApi.endpoints.replaceCart.initiate(updatedCartItems),
      ).unwrap();
    } catch (error) {
      const isInsufficientStockError =
        error?.data?.code === 'INSUFFICIENT_STOCK';
      const availableStock = Number(error?.data?.availableStock);
      const hasAvailableStock =
        Number.isFinite(availableStock) && availableStock >= 0;

      const restoredCartItems =
        isInsufficientStockError && hasAvailableStock
          ? previousCartItems.map((previousCartItem) =>
              previousCartItem.productId === cartItem.productId
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
    }
  };
}
