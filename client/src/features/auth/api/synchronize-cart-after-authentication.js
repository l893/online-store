import { productsApi } from '../../../entities/products';
import { api } from '../../../shared/lib';
import { mergeCartItems, setCartItems } from '../../cart';

export async function synchronizeCartAfterAuthentication({
  dispatch,
  getState,
}) {
  const localCartItems = getState().cart.items || [];

  const serverCartResponse = await dispatch(
    api.endpoints.getCart.initiate(undefined, {
      forceRefetch: true,
      subscribe: false,
    }),
  ).unwrap();

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
      api.endpoints.replaceCart.initiate(mergedCartItems),
    ).unwrap();

    const updatedServerCartItems = Array.isArray(updatedCartResponse.items)
      ? updatedCartResponse.items
      : [];

    dispatch(
      api.util.updateQueryData('getCart', undefined, (cachedCartResponse) => {
        Object.assign(cachedCartResponse, updatedCartResponse);
      }),
    );

    dispatch(setCartItems(updatedServerCartItems));
  } catch {
    dispatch(setCartItems(serverCartItems));
  }
}
