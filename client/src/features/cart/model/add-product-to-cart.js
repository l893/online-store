import { cartApi } from '../cart.api';
import { addItem } from './cart.slice';

export function addProductToCart(cartItem) {
  return async (dispatch, getState) => {
    dispatch(addItem(cartItem));

    const isAuthenticated = Boolean(getState().auth.user);

    if (!isAuthenticated) {
      return;
    }

    const updatedCartItems = getState().cart.items;

    try {
      await dispatch(
        cartApi.endpoints.replaceCart.initiate(updatedCartItems),
      ).unwrap();
    } catch {
      // Ошибка синхронизации не должна отменять локальное добавление товара.
    }
  };
}
