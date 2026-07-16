import { api } from '../../../shared/lib/api';
import { mergeCartItems, setAll } from '../../cart';

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
    dispatch(setAll(serverCartItems));
    return;
  }

  const mergedCartItems = mergeCartItems({
    serverItems: serverCartItems,
    localItems: localCartItems,
  });

  const updatedCartResponse = await dispatch(
    api.endpoints.replaceCart.initiate(mergedCartItems),
  ).unwrap();

  dispatch(setAll(updatedCartResponse.items || []));
}
