import { createSlice } from '@reduxjs/toolkit';

const initialState = { items: [] }; // [{productId, title, price, qty, image}]

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, { payload }) => {
      const existingItemIndex = state.items.findIndex(
        (cartItem) => cartItem.productId === payload.productId,
      );
      const quantity = payload.qty || 1;

      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].qty += quantity;
      } else {
        state.items.push({ ...payload, qty: quantity });
      }
    },
    changeQty: (state, { payload: { productId, qty } }) => {
      const cartItem = state.items.find((item) => item.productId === productId);

      if (cartItem) {
        cartItem.qty = Math.max(1, qty);
      }
    },
    removeItem: (state, { payload: productId }) => {
      state.items = state.items.filter(
        (cartItem) => cartItem.productId !== productId,
      );
    },
    clear: (state) => {
      state.items = [];
    },
    setAll: (state, { payload }) => {
      state.items = payload || [];
    },
  },
});

export const { addItem, changeQty, removeItem, clear, setAll } =
  cartSlice.actions;
export default cartSlice.reducer;
