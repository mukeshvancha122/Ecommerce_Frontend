import { createSlice } from "@reduxjs/toolkit";

// Load cart from localStorage
const load = () => {
  try {
    return JSON.parse(localStorage.getItem("cart_v1")) || { items: [] };
  } catch {
    return { items: [] };
  }
};

// Save cart to localStorage
const save = (state) => {
  try {
    localStorage.setItem("cart_v1", JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
};

const initialState = load();

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    ...initialState,
    items: initialState.items || [],
  },
  reducers: {
    // Add item to cart or update quantity if item already exists
    addItem: {
      prepare: ({ sku, title, price, qty = 1, image, id = null }) => ({
        payload: { sku, title, price, qty, image, id: id || sku }
      }),
      reducer(state, action) {
        const { sku, qty, ...itemData } = action.payload;
        const idx = state.items.findIndex(i => String(i.sku) === String(sku));
        
        if (idx >= 0) {
          // Item exists, update quantity
          state.items[idx].qty = Math.min(99, state.items[idx].qty + qty);
        } else {
          // New item, add to cart
          state.items.push(action.payload);
        }
        save(state);
      }
    },
    
    // Remove item from cart
    removeItem(state, action) {
      const sku = action.payload.sku || action.payload;
      state.items = state.items.filter(i => String(i.sku) !== String(sku));
      save(state);
    },
    
    // Set quantity for a specific item
    setQty(state, action) {
      const { sku, qty } = action.payload;
      const item = state.items.find(i => String(i.sku) === String(sku));
      if (item) {
        item.qty = Math.max(1, Math.min(99, qty));
        save(state);
      }
    },
    
    // Clear entire cart
    clearCart(state) {
      state.items = [];
      save(state);
    },
    
    // Set cart items (replace entire cart)
    setCartItems(state, action) {
      state.items = Array.isArray(action.payload) ? action.payload : [];
      save(state);
    },
    
    // Increment item quantity
    incrementQty(state, action) {
      const sku = action.payload.sku || action.payload;
      const item = state.items.find(i => String(i.sku) === String(sku));
      if (item) {
        item.qty = Math.min(99, item.qty + 1);
        save(state);
      }
    },
    
    // Decrement item quantity
    decrementQty(state, action) {
      const sku = action.payload.sku || action.payload;
      const item = state.items.find(i => String(i.sku) === String(sku));
      if (item) {
        item.qty = Math.max(1, item.qty - 1);
        save(state);
      }
    },
  },
});

export const {
  addItem,
  removeItem,
  setQty,
  clearCart,
  setCartItems,
  incrementQty,
  decrementQty,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items || [];
export const selectCartCount = (state) => 
  (state.cart.items || []).reduce((sum, item) => sum + (item.qty || 0), 0);
export const selectCartTotal = (state) => 
  (state.cart.items || []).reduce((sum, item) => sum + (item.qty || 0) * (item.price || 0), 0);
export const selectCartItem = (state, sku) => 
  (state.cart.items || []).find(item => String(item.sku) === String(sku));

export default cartSlice.reducer;
