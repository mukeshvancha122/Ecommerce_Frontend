import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../features/auth/AuthSlice";
import { selectCartItems, fetchCartFromBackend, syncCartToBackend, updateCartItemBackend, removeCartItemBackend } from "../features/cart/CartSlice";
import { clearCartBackend } from "../api/cart/CartService";

/**
 * Custom hook to sync cart operations with backend when user is authenticated
 * Automatically syncs cart changes to backend API
 */
export const useCartSync = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const cartItems = useSelector(selectCartItems);
  const isAuthenticated = !!user;

  // Fetch cart from backend when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User authenticated, fetching cart from backend...");
      dispatch(fetchCartFromBackend());
    }
  }, [isAuthenticated, dispatch]);

  /**
   * Sync add item operation to backend
   */
  const syncAddItem = async (item) => {
    if (isAuthenticated) {
      try {
        await dispatch(syncCartToBackend(item)).unwrap();
      } catch (error) {
        console.error("Failed to sync add item to backend:", error);
        // Continue with local operation even if backend sync fails
      }
    }
  };

  /**
   * Sync update item operation to backend
   */
  const syncUpdateItem = async (sku, qty) => {
    if (isAuthenticated) {
      try {
        // Find the item in cart to get its backend ID and current quantity
        const item = cartItems.find(i => String(i.sku) === String(sku));
        if (item) {
          const currentQty = item.qty || 0;
          // item.id is the cart item ID (for PATCH), item.sku is the variation ID (for reduce endpoint)
          const cartItemId = item.id; // Cart item ID for PATCH endpoint
          const variationId = item.sku; // Variation ID for reduce endpoint
          
          // Pass current quantity and variation ID so updateCartItem can use reduce endpoint when decreasing
          const updatedItem = await dispatch(updateCartItemBackend({ 
            itemId: cartItemId || variationId, // Use cart item ID if available, else variation ID
            qty, 
            currentQty,
            variationId: variationId // Always pass variation ID for reduce endpoint
          })).unwrap();
          // Update local cart with the updated item from backend (to sync any changes)
          // The reducer already handles the update, but we ensure backend ID is preserved
          return updatedItem;
        } else {
          // If item not found, try to fetch cart from backend to sync
          console.warn("Item not found in cart, fetching cart to sync...");
          await dispatch(fetchCartFromBackend());
        }
      } catch (error) {
        console.error("Failed to sync update item to backend:", error);
      }
    }
  };

  /**
   * Sync remove item operation to backend
   */
  const syncRemoveItem = async (sku) => {
    if (isAuthenticated) {
      try {
        // Find the item in cart
        const item = cartItems.find(i => String(i.sku) === String(sku));
        if (item) {
          // Use variation ID (sku) for remove endpoint - API expects item_id (variation ID)
          await dispatch(removeCartItemBackend(item.sku)).unwrap();
        } else {
          // If item not found, it might only exist locally
          console.warn("Item not found in cart, may only exist locally");
        }
      } catch (error) {
        console.error("Failed to sync remove item to backend:", error);
      }
    }
  };

  /**
   * Sync clear cart operation to backend
   */
  const syncClearCart = async () => {
    if (isAuthenticated) {
      try {
        await clearCartBackend();
      } catch (error) {
        console.error("Failed to sync clear cart to backend:", error);
      }
    }
  };

  return {
    isAuthenticated,
    syncAddItem,
    syncUpdateItem,
    syncRemoveItem,
    syncClearCart,
  };
};

