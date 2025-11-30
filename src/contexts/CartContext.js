import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/AuthSlice";
import {
  getCart,
  addCartItem,
  removeCartItem,
  updateCartItem,
  clearCartBackend,
} from "../api/cart/CartService";

// Load cart from localStorage (for guests)
const loadLocalCart = () => {
  try {
    const stored = localStorage.getItem("cart_v1");
    return stored ? JSON.parse(stored).items || [] : [];
  } catch {
    return [];
  }
};

// Save cart to localStorage (for guests)
const saveLocalCart = (items) => {
  try {
    localStorage.setItem("cart_v1", JSON.stringify({ items }));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
};

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const user = useSelector(selectUser);
  const isAuthenticated = Boolean(user?.email);
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch cart from backend or localStorage
  const fetchCart = useCallback(async () => {
    console.log("[CartContext] fetchCart() - Starting fetch, isAuthenticated:", isAuthenticated);
    setLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated) {
        // Fetch from backend
        const backendItems = await getCart();
        console.log("[CartContext] fetchCart() - Backend items:", backendItems);
        // Always create a new array reference to ensure React detects the change
        setItems([...backendItems]);
      } else {
        // Load from localStorage for guests
        const localItems = loadLocalCart();
        console.log("[CartContext] fetchCart() - Local items:", localItems);
        // Always create a new array reference to ensure React detects the change
        setItems([...localItems]);
      }
    } catch (err) {
      console.error("[CartContext] Error fetching cart:", err);
      setError(err.message || "Failed to load cart");
      // Fallback to localStorage on error
      if (isAuthenticated) {
        const localItems = loadLocalCart();
        setItems([...localItems]);
      } else {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initial fetch on mount and when auth state changes
  useEffect(() => {
    const syncCartOnLogin = async () => {
      if (isAuthenticated) {
        // When user logs in, merge localStorage cart with backend cart
        const localItems = loadLocalCart();
        if (localItems.length > 0) {
          try {
            // Add local items to backend one by one
            for (const localItem of localItems) {
              try {
                await addCartItem(localItem);
              } catch (err) {
                console.error("Failed to sync local item to backend:", err);
              }
            }
            // Clear localStorage after syncing
            saveLocalCart([]);
          } catch (err) {
            console.error("Error syncing cart on login:", err);
          }
        }
      }
      // Fetch cart (will get backend cart if authenticated, or empty if guest)
      await fetchCart();
    };
    
    syncCartOnLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Add item to cart
  const addItem = useCallback(async (item) => {
    console.log("[CartContext] addItem() - Adding item:", item);
    try {
      if (isAuthenticated) {
        // Add via backend API
        await addCartItem(item);
        // Refresh cart to get updated data
        await fetchCart();
      } else {
        // Add to localStorage for guests
        const currentItems = loadLocalCart();
        const existingIndex = currentItems.findIndex(
          (i) => String(i.sku) === String(item.sku)
        );
        
        if (existingIndex >= 0) {
          // Update quantity if item exists
          currentItems[existingIndex].qty = Math.min(
            99,
            currentItems[existingIndex].qty + (item.qty || 1)
          );
        } else {
          // Add new item
          currentItems.push({
            ...item,
            qty: item.qty || 1,
          });
        }
        
        saveLocalCart(currentItems);
        setItems([...currentItems]); // Create new array
      }
    } catch (err) {
      console.error("[CartContext] Error adding item to cart:", err);
      setError(err.message || "Failed to add item to cart");
      throw err;
    }
  }, [isAuthenticated, fetchCart]);

  // Remove item from cart
  const removeItem = useCallback(async (sku) => {
    console.log("[CartContext] removeItem() - Removing item with sku:", sku);
    try {
      if (isAuthenticated) {
        // Remove via backend API
        await removeCartItem(sku);
        // Refresh cart
        await fetchCart();
      } else {
        // Remove from localStorage for guests
        const currentItems = loadLocalCart().filter(
          (i) => String(i.sku) !== String(sku)
        );
        saveLocalCart(currentItems);
        setItems([...currentItems]); // Create new array
      }
    } catch (err) {
      console.error("[CartContext] Error removing item from cart:", err);
      setError(err.message || "Failed to remove item from cart");
      // Still refresh cart even on error to get current state
      if (isAuthenticated) {
        try {
          await fetchCart();
        } catch (refreshError) {
          console.error("[CartContext] Error refreshing cart after remove error:", refreshError);
        }
      }
      throw err;
    }
  }, [isAuthenticated, fetchCart]);

  // Update item quantity
  const updateItem = useCallback(async (sku, qty) => {
    console.log("[CartContext] updateItem() - Updating item:", { sku, qty });
    try {
      const newQty = Math.max(1, Math.min(99, parseInt(qty, 10)));
      
      if (isAuthenticated) {
        // Find current item to get cart item ID and current quantity
        const currentItem = items.find((i) => String(i.sku) === String(sku));
        if (!currentItem) {
          throw new Error("Item not found in cart");
        }
        
        console.log("[CartContext] updateItem() - Current item:", currentItem);
        
        // Update via backend API
        await updateCartItem(
          currentItem.id, // cart item ID
          newQty,
          currentItem.qty, // current quantity
          sku // variation ID
        );
        
        // Always refresh cart after update to get latest state from backend
        console.log("[CartContext] updateItem() - Refreshing cart after update...");
        await fetchCart();
        console.log("[CartContext] updateItem() - Cart refreshed successfully");
      } else {
        // Update in localStorage for guests
        const currentItems = loadLocalCart();
        const itemIndex = currentItems.findIndex(
          (i) => String(i.sku) === String(sku)
        );
        
        if (itemIndex >= 0) {
          currentItems[itemIndex].qty = newQty;
          saveLocalCart(currentItems);
          setItems([...currentItems]); // Create new array
        }
      }
    } catch (err) {
      console.error("[CartContext] Error updating item quantity:", err);
      setError(err.message || "Failed to update item quantity");
      // Still refresh cart even on error to get current state
      if (isAuthenticated) {
        try {
          await fetchCart();
        } catch (refreshError) {
          console.error("[CartContext] Error refreshing cart after update error:", refreshError);
        }
      }
      throw err;
    }
  }, [isAuthenticated, items, fetchCart]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    console.log("[CartContext] clearCart() - Clearing cart");
    try {
      if (isAuthenticated) {
        // Try to clear via backend API
        try {
          await clearCartBackend();
          console.log("[CartContext] clearCart() - Backend cart cleared successfully");
        } catch (backendError) {
          // If backend clear fails (e.g., 404), try to remove items individually
          console.warn("[CartContext] clearCart() - Backend clear failed, trying to remove items individually:", backendError);
          if (items.length > 0) {
            // Remove each item individually
            for (const item of items) {
              try {
                await removeCartItem(item.sku);
                console.log("[CartContext] clearCart() - Removed item:", item.sku);
              } catch (itemError) {
                console.warn("[CartContext] clearCart() - Failed to remove item:", item.sku, itemError);
              }
            }
          }
        }
        // Always refresh cart to get latest state
        await fetchCart();
      } else {
        // Clear localStorage for guests
        saveLocalCart([]);
        setItems([]);
        console.log("[CartContext] clearCart() - Local cart cleared successfully");
      }
    } catch (err) {
      console.error("[CartContext] Error clearing cart:", err);
      setError(err.message || "Failed to clear cart");
      // Don't throw - allow order confirmation to proceed even if cart clear fails
      // Cart will be refreshed on next page load
    }
  }, [isAuthenticated, fetchCart, items]);

  // Calculate cart totals
  const count = items.reduce((sum, item) => sum + (item.qty || 0), 0);
  const total = items.reduce(
    (sum, item) => sum + (item.qty || 0) * (item.price || 0),
    0
  );

  const value = {
    items,
    loading,
    error,
    count,
    total,
    addItem,
    removeItem,
    updateItem,
    clearCart,
    refreshCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

