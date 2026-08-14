import { productsApi } from '@entities/products';
import { cartApi, mergeCartItems, setCartItems } from '@features/cart';

import type { AppListenerDispatch, RootState } from '../store/store';

interface SynchronizeCartAfterAuthenticationOptions {
  readonly dispatch: AppListenerDispatch;
  readonly getState: () => RootState;
  readonly signal: AbortSignal;
}

export async function synchronizeCartAfterAuthentication({
  dispatch,
  getState,
  signal,
}: SynchronizeCartAfterAuthenticationOptions): Promise<void> {
  const localCartItems = getState().cart.items || [];

  const serverCartResponse = await dispatch(
    cartApi.endpoints.getCart.initiate(undefined, {
      forceRefetch: true,
      subscribe: false,
    }),
  ).unwrap();

  if (signal.aborted) {
    return;
  }

  const serverCartItems = Array.isArray(serverCartResponse.items)
    ? serverCartResponse.items
    : [];

  if (localCartItems.length === 0) {
    dispatch(setCartItems(serverCartItems));
    return;
  }

  const productIds = Array.from(
    new Set(
      [...serverCartItems, ...localCartItems]
        .map((cartItem) => cartItem.productId)
        .filter(Boolean),
    ),
  );

  try {
    const productAvailabilityResponse = await dispatch(
      productsApi.endpoints.getProductsAvailability.initiate(productIds, {
        forceRefetch: true,
        subscribe: false,
      }),
    ).unwrap();

    if (signal.aborted) {
      return;
    }

    const productAvailabilityItems = Array.isArray(
      productAvailabilityResponse.items,
    )
      ? productAvailabilityResponse.items
      : [];

    const mergedCartItems = mergeCartItems({
      serverCartItems,
      localCartItems,
      productAvailabilityItems,
    });

    if (mergedCartItems.length === 0) {
      dispatch(setCartItems([]));
      return;
    }

    const updatedCartResponse = await dispatch(
      cartApi.endpoints.replaceCart.initiate(mergedCartItems),
    ).unwrap();

    if (signal.aborted) {
      return;
    }

    const updatedServerCartItems = Array.isArray(updatedCartResponse.items)
      ? updatedCartResponse.items
      : [];

    dispatch(
      cartApi.util.updateQueryData(
        'getCart',
        undefined,
        (cachedCartResponse) => {
          Object.assign(cachedCartResponse, updatedCartResponse);
        },
      ),
    );

    dispatch(setCartItems(updatedServerCartItems));
  } catch {
    if (!signal.aborted) {
      dispatch(setCartItems(serverCartItems));
    }
  }
}
