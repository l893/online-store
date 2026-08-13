import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { CartItem, CartItemDraft, CartState } from './cart.types';

interface ChangeCartItemQuantityPayload {
  readonly productId: string;
  readonly qty: number;
}

const initialCartState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartState,
  reducers: {
    addCartItem: (state, action: PayloadAction<CartItemDraft>) => {
      const cartItem = action.payload;
      const availableStock = Math.max(0, Number(cartItem.stock) || 0);

      if (availableStock === 0) {
        return;
      }

      const existingItemIndex = state.items.findIndex(
        (existingCartItem) => existingCartItem.productId === cartItem.productId,
      );

      const quantity = Math.min(
        availableStock,
        Math.max(1, Number(cartItem.qty) || 1),
      );

      if (existingItemIndex >= 0) {
        const existingCartItem = state.items[existingItemIndex];

        existingCartItem.qty = Math.min(
          availableStock,
          existingCartItem.qty + quantity,
        );
        existingCartItem.stock = availableStock;
      } else {
        state.items.push({
          ...cartItem,
          stock: availableStock,
          qty: quantity,
        });
      }
    },
    changeCartItemQuantity: (
      state,
      action: PayloadAction<ChangeCartItemQuantityPayload>,
    ) => {
      const { productId, qty: quantity } = action.payload;

      const cartItem = state.items.find(
        (currentCartItem) => currentCartItem.productId === productId,
      );

      if (cartItem) {
        cartItem.qty = Math.max(1, quantity);
      }
    },
    removeCartItem: (state, action: PayloadAction<string>) => {
      const productId = action.payload;

      state.items = state.items.filter(
        (cartItem) => cartItem.productId !== productId,
      );
    },
    clearCart: (state) => {
      state.items = [];
    },
    setCartItems: (
      state,
      action: PayloadAction<CartItem[] | null | undefined>,
    ) => {
      state.items = action.payload || [];
    },
  },
});

export const {
  addCartItem,
  changeCartItemQuantity,
  removeCartItem,
  clearCart,
  setCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;
