export {
  default as cartReducer,
  clearCart,
  setCartItems,
} from './model/cart.slice';
export type {
  CartItem,
  CartItemDraft,
  CartState,
  CartTotals,
} from './model/cart.types';

export {
  cartApi,
  useGetCartQuery,
  useLazyGetCartQuery,
  useReplaceCartMutation,
} from './api/cart.api';
export type { ReplaceCartTrigger } from './api/cart.api';
export type { CartResponse } from './api/cart.types';

export { createCartItemFromProduct } from './lib/create-cart-item-from-product';
export { applyProductDetailsToCartItems } from './lib/apply-product-details-to-cart-items';
export {
  clearGuestCartItems,
  loadGuestCartItems,
  saveGuestCartItems,
} from './lib/guest-cart-storage';
export { getCartTotals } from './lib/get-cart-totals';
export { mergeCartItems } from './lib/merge-cart-items';
export { addProductToCart } from './model/add-product-to-cart';
export { useCartItemActions } from './model/use-cart-item-actions';
export { useInitialCartSync } from './model/use-initial-cart-sync';
