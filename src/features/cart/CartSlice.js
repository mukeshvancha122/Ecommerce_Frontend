import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCart, addCartItem, updateCartItem, removeCartItem, clearCartBackend, mergeCart } from "../../api/cart/CartService";

const load = () => {
  try { return JSON.parse(localStorage.getItem("cart_v1")) || { items: [] }; }
  catch { return { items: [] }; }
};
const save = (state) => localStorage.setItem("cart_v1", JSON.stringify(state));

const initialState = load();

// Async thunks for backend operations
export const fetchCartFromBackend = createAsyncThunk(
  "cart/fetchFromBackend",
  async (_, { rejectWithValue }) => {
    try {
      const items = await getCart();
      return items;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const syncCartToBackend = createAsyncThunk(
  "cart/syncToBackend",
  async (item, { rejectWithValue }) => {
    try {
      const syncedItem = await addCartItem(item);
      return syncedItem;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItemBackend = createAsyncThunk(
  "cart/updateItemBackend",
  async ({ itemId, qty, currentQty = null, variationId = null }, { rejectWithValue }) => {
    try {
      const updatedItem = await updateCartItem(itemId, qty, currentQty, variationId);
      return updatedItem;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeCartItemBackend = createAsyncThunk(
  "cart/removeItemBackend",
  async (variationId, { rejectWithValue }) => {
    try {
      await removeCartItem(variationId);
      return variationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const mergeCartWithBackend = createAsyncThunk(
  "cart/mergeWithBackend",
  async (localItems, { rejectWithValue }) => {
    try {
      const mergedItems = await mergeCart(localItems);
      return mergedItems;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    ...initialState,
    syncing: false,
    error: null,
    lastSynced: null,
  },
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
    },
    setCartItems(state, action) {
      state.items = action.payload;
      save(state);
    },
    setSyncing(state, action) {
      state.syncing = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch cart from backend
    builder
      .addCase(fetchCartFromBackend.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(fetchCartFromBackend.fulfilled, (state, action) => {
        state.items = action.payload;
        state.syncing = false;
        state.lastSynced = new Date().toISOString();
        save(state);
      })
      .addCase(fetchCartFromBackend.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.payload;
        // Don't clear local cart on error - keep using local storage
      })
      // Merge cart with backend
      .addCase(mergeCartWithBackend.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(mergeCartWithBackend.fulfilled, (state, action) => {
        state.items = action.payload;
        state.syncing = false;
        state.lastSynced = new Date().toISOString();
        save(state);
      })
      .addCase(mergeCartWithBackend.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.payload;
        // Keep local cart if merge fails
      });
  }
});

export const { addItem, removeItem, setQty, clearCart, setCartItems, setSyncing } = cartSlice.actions;

// selectors
export const selectCartItems = (s) => s.cart.items;
export const selectCartCount = (s) => s.cart.items.reduce((sum, i) => sum + i.qty, 0);
export const selectCartTotal = (s) => s.cart.items.reduce((sum, i) => sum + i.qty * i.price, 0);

export default cartSlice.reducer;
