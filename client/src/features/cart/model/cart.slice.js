import { createSlice } from '@reduxjs/toolkit';

const initialCartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartState,
  reducers: {
    addCartItem: (state, action) => {
      const cartItem = action.payload;

      const existingItemIndex = state.items.findIndex(
        (existingCartItem) => existingCartItem.productId === cartItem.productId,
      );

      const quantity = cartItem.qty || 1;

      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].qty += quantity;
      } else {
        state.items.push({
          ...cartItem,
          qty: quantity,
        });
      }
    },
    changeCartItemQuantity: (state, action) => {
      const { productId, qty: quantity } = action.payload;

      const cartItem = state.items.find(
        (currentCartItem) => currentCartItem.productId === productId,
      );

      if (cartItem) {
        cartItem.qty = Math.max(1, quantity);
      }
    },
    removeCartItem: (state, action) => {
      const productId = action.payload;

      state.items = state.items.filter(
        (cartItem) => cartItem.productId !== productId,
      );
    },
    clearCart: (state) => {
      state.items = [];
    },
    setCartItems: (state, action) => {
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
