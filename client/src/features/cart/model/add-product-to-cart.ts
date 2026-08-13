import { cartApi } from '../api/cart.api';
import { getCartMutationErrorDetails } from '../lib/get-cart-mutation-error-details';
import { addCartItem, setCartItems } from './cart.slice';
import type { CartItemDraft } from './cart.types';
import type { CartOrchestrationThunk } from './cart-orchestration.types';

interface AddProductToCartOptions {
  readonly cartItem: CartItemDraft;
  readonly isAuthenticated: boolean;
}

export function addProductToCart({
  cartItem,
  isAuthenticated,
}: AddProductToCartOptions): CartOrchestrationThunk<Promise<void>> {
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
    } catch (error: unknown) {
      const { isInsufficientStockError, availableStock: errorAvailableStock } =
        getCartMutationErrorDetails(error);
      const hasAvailableStock = errorAvailableStock !== null;

      const restoredCartItems =
        isInsufficientStockError && hasAvailableStock
          ? previousCartItems.map((previousCartItem) =>
              previousCartItem.productId === cartItem.productId
                ? {
                    ...previousCartItem,
                    stock: errorAvailableStock,
                  }
                : previousCartItem,
            )
          : previousCartItems;

      dispatch(setCartItems(restoredCartItems));

      if (isInsufficientStockError) {
        dispatch(cartApi.util.invalidateTags(['Product']));
      }
    }
  };
}
