import { createSlice } from '@reduxjs/toolkit';

const initialState = { items: [] }; // [{productId, title, price, qty, image}]

const slice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, { payload }) => {
      const i = state.items.findIndex(
        (it) => it.productId === payload.productId,
      );
      if (i >= 0) state.items[i].qty += payload.qty || 1;
      else state.items.push({ ...payload, qty: payload.qty || 1 });
    },
    changeQty: (state, { payload: { productId, qty } }) => {
      const it = state.items.find((i) => i.productId === productId);
      if (it) it.qty = Math.max(1, qty);
    },
    removeItem: (state, { payload: productId }) => {
      state.items = state.items.filter((i) => i.productId !== productId);
    },
    clear: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, changeQty, removeItem, clear } = slice.actions;
export default slice.reducer;
