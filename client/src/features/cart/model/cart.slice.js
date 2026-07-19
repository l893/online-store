import { createSlice } from '@reduxjs/toolkit';

const initialCartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartState,
  reducers: {
    addItem: (state, action) => {
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
    changeQty: (state, action) => {
      const { productId, qty: quantity } = action.payload;

      const cartItem = state.items.find(
        (currentCartItem) => currentCartItem.productId === productId,
      );

      if (cartItem) {
        cartItem.qty = Math.max(1, quantity);
      }
    },
    removeItem: (state, action) => {
      const productId = action.payload;

      state.items = state.items.filter(
        (cartItem) => cartItem.productId !== productId,
      );
    },
    clear: (state) => {
      state.items = [];
    },
    setAll: (state, action) => {
      state.items = action.payload || [];
    },
  },
});

export const { addItem, changeQty, removeItem, clear, setAll } =
  cartSlice.actions;
export default cartSlice.reducer;
