import { createSlice } from "@reduxjs/toolkit";

const load = () => {
  try { return JSON.parse(localStorage.getItem("cart_v1")) || { items: [] }; }
  catch { return { items: [] }; }
};
const save = (state) => localStorage.setItem("cart_v1", JSON.stringify(state));

const initialState = load();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: {
      prepare: ({ sku, title, price, qty = 1, image }) => ({
        payload: { sku, title, price, qty, image }
      }),
      reducer(state, action) {
        const { sku, qty } = action.payload;
        const idx = state.items.findIndex(i => i.sku === sku);
        if (idx >= 0) {
          state.items[idx].qty = Math.min(99, state.items[idx].qty + qty);
        } else {
          state.items.push(action.payload);
        }
        save(state);
      }
    },
    removeItem(state, action) {
      state.items = state.items.filter(i => i.sku !== action.payload.sku);
      save(state);
    },
    setQty(state, action) {
      const { sku, qty } = action.payload;
      const it = state.items.find(i => i.sku === sku);
      if (it) it.qty = Math.max(1, Math.min(99, qty));
      save(state);
    },
    clearCart(state) {
      state.items = [];
      save(state);
    }
  }
});

export const { addItem, removeItem, setQty, clearCart } = cartSlice.actions;

// selectors
export const selectCartItems = (s) => s.cart.items;
export const selectCartCount = (s) => s.cart.items.reduce((sum, i) => sum + i.qty, 0);
export const selectCartTotal = (s) => s.cart.items.reduce((sum, i) => sum + i.qty * i.price, 0);

export default cartSlice.reducer;
