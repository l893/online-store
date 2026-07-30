export {
  default as cartReducer,
  clearCart,
  setCartItems,
} from './model/cart.slice';

export {
  useGetCartQuery,
  useLazyGetCartQuery,
  useReplaceCartMutation,
} from './api/cart.api';

export { getCartTotals } from './lib/get-cart-totals';
export { mergeCartItems } from './lib/merge-cart-items';
export { addProductToCart } from './model/add-product-to-cart';
export { useCartItemActions } from './model/use-cart-item-actions';
export { useInitialCartSync } from './model/use-initial-cart-sync';
