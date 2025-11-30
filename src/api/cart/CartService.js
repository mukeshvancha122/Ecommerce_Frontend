import API from "../../axios";

/**
 * Cart Service - Handles cart operations with backend API
 * Supports both guest mode (localStorage) and authenticated mode (backend sync)
 */

/**
 * Get cart items from backend
 * GET /api/v1/orders/cart/
 * @returns {Promise<Array>} Array of cart items
 */
export const getCart = async () => {
  try {
    const response = await API.get("/v1/orders/cart/");
    
    // Handle different response formats
    let items = [];
    if (Array.isArray(response.data)) {
      items = response.data;
    } else if (response.data?.results && Array.isArray(response.data.results)) {
      items = response.data.results;
    } else if (response.data?.items && Array.isArray(response.data.items)) {
      items = response.data.items;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      items = response.data.data;
    }
    
    // Transform backend format to frontend format
    // Backend uses item_id (variation ID) and quantity
    return items.map(item => ({
      id: item.id || item.cart_item_id, // Backend cart item ID (needed for update/delete)
      sku: item.item_id || item.product_id || item.sku || item.product?.id || item.variation_id || item.id,
      title: item.product_name || item.product?.product_name || item.title || item.name,
      price: parseFloat(item.price || item.product_price || item.product?.price || 0),
      qty: parseInt(item.quantity || item.qty || 1, 10),
      image: item.image || item.product_image || item.product?.image || item.thumbnail || "/images/NO_IMG.png",
    }));
  } catch (error) {
    console.error("Error fetching cart from backend:", error);
    // Return empty array if unauthorized or error
    if (error.response?.status === 401) {
      console.warn("Unauthorized - user not logged in, using local cart");
    }
    return [];
  }
};

/**
 * Add item to cart on backend
 * POST /api/v1/orders/cart/
 * Note: API expects items array with item_id (variation ID) and quantity
 * @param {Object} item - Cart item to add
 * @param {string|number} item.sku - Product variation ID (this is the item_id)
 * @param {number} item.qty - Quantity
 * @returns {Promise<Object>} Added cart item
 */
export const addCartItem = async (item) => {
  try {
    // API expects: { items: [{ item_id: <variation_id>, quantity: <qty> }] }
    const response = await API.post("/v1/orders/cart/", {
      items: [
        {
          item_id: parseInt(item.sku, 10), // item_id should be the variation ID
          quantity: parseInt(item.qty || 1, 10),
        }
      ]
    });
    
    // Transform response to frontend format
    // Response might be the cart item or the full cart
    const responseData = response.data;
    let backendItem;
    
    if (responseData.items && Array.isArray(responseData.items) && responseData.items.length > 0) {
      // Response contains items array
      backendItem = responseData.items[responseData.items.length - 1]; // Get the last added item
    } else if (responseData.item_id || responseData.id) {
      // Response is a single item
      backendItem = responseData;
    } else {
      // Fallback: use the item we sent
      backendItem = { item_id: item.sku, quantity: item.qty || 1 };
    }
    
    return {
      id: backendItem.id || backendItem.cart_item_id || backendItem.item_id, // Backend cart item ID
      sku: backendItem.item_id || backendItem.product_id || backendItem.sku || backendItem.product?.id || item.sku,
      title: backendItem.product_name || backendItem.product?.product_name || backendItem.title || item.title,
      price: parseFloat(backendItem.price || backendItem.product_price || backendItem.product?.price || item.price || 0),
      qty: parseInt(backendItem.quantity || backendItem.qty || item.qty || 1, 10),
      image: backendItem.image || backendItem.product_image || backendItem.product?.image || item.image || "/images/NO_IMG.png",
    };
  } catch (error) {
    console.error("Error adding item to backend cart:", error);
    throw error;
  }
};

/**
 * Reduce cart item quantity on backend
 * PUT /api/v1/orders/cart/reduce/
 * Note: item_id should be the variation ID (not cart item ID)
 * @param {string|number} variationId - Product variation ID (item_id in API)
 * @param {number} reduceBy - Amount to reduce quantity by
 * @returns {Promise<Object>} Updated cart item response
 */
export const reduceCartItem = async (variationId, reduceBy = 1) => {
  try {
    const response = await API.put("/v1/orders/cart/reduce/", {
      item_id: parseInt(variationId, 10), // item_id is the variation ID
      quantity: parseInt(reduceBy, 10),
    });
    
    // Response format: { item_id: <variation_id>, quantity: <reduced_by> }
    return response.data;
  } catch (error) {
    console.error("Error reducing cart item on backend:", error);
    throw error;
  }
};

/**
 * Update cart item quantity on backend
 * Uses reduce endpoint for decreases, PATCH for increases (if available)
 * @param {string|number} itemId - Can be cart item ID or variation ID
 * @param {number} qty - New quantity
 * @param {number} currentQty - Current quantity (to determine if increasing or decreasing)
 * @param {string|number} variationId - Variation ID (item_id for reduce endpoint)
 * @returns {Promise<Object>} Updated cart item
 */
export const updateCartItem = async (itemId, qty, currentQty = null, variationId = null) => {
  try {
    // Use variation ID for reduce endpoint (item_id in API)
    const varId = variationId || itemId;
    
    // If we have current quantity and new qty is less, use reduce endpoint
    if (currentQty !== null && qty < currentQty) {
      const reduceBy = currentQty - qty;
      await reduceCartItem(varId, reduceBy);
      // Fetch updated cart to get the new state
      const cart = await getCart();
      const updatedItem = cart.find(item => {
        // Match by variation ID (sku) or cart item ID
        return String(item.sku) === String(varId) || String(item.id) === String(itemId);
      });
      if (updatedItem) {
        return updatedItem;
      }
    }
    
    // For increases or if no current qty, try PATCH endpoint
    // Note: This endpoint might not exist, so we'll handle the error gracefully
    try {
      const response = await API.patch(`/v1/orders/cart/${itemId}/`, {
        quantity: qty,
      });
      
      const backendItem = response.data;
      return {
        id: backendItem.id || backendItem.cart_item_id, // Backend cart item ID
        sku: backendItem.item_id || backendItem.product_id || backendItem.sku || backendItem.product?.id || backendItem.id,
        title: backendItem.product_name || backendItem.product?.product_name || backendItem.title,
        price: parseFloat(backendItem.price || backendItem.product_price || backendItem.product?.price || 0),
        qty: parseInt(backendItem.quantity || backendItem.qty || qty, 10),
        image: backendItem.image || backendItem.product_image || backendItem.product?.image || "/images/NO_IMG.png",
      };
    } catch (patchError) {
      // If PATCH doesn't work and we're decreasing, we already handled it above
      // If increasing, we might need to add items instead
      if (currentQty !== null && qty > currentQty) {
        // For increases, we might need to add the difference
        // But since we don't have an "add" endpoint for existing items, fetch cart
        const cart = await getCart();
        return cart.find(item => String(item.sku) === String(varId) || String(item.id) === String(itemId)) || { sku: varId, qty };
      }
      throw patchError;
    }
  } catch (error) {
    console.error("Error updating cart item on backend:", error);
    throw error;
  }
};

/**
 * Remove item from cart on backend
 * DELETE /api/v1/orders/cart/remove/
 * Note: item_id should be the variation ID (not cart item ID)
 * @param {string|number} variationId - Product variation ID (item_id in API)
 * @returns {Promise<void>}
 */
export const removeCartItem = async (variationId) => {
  try {
    // API expects item_id (variation ID) in request body
    await API.delete("/v1/orders/cart/remove/", {
      data: {
        item_id: parseInt(variationId, 10)
      }
    });
  } catch (error) {
    console.error("Error removing cart item from backend:", error);
    throw error;
  }
};

/**
 * Clear entire cart on backend
 * DELETE /api/v1/orders/cart/remove/
 * @returns {Promise<void>}
 */
export const clearCartBackend = async () => {
  try {
    await API.delete("/v1/orders/cart/remove/");
  } catch (error) {
    console.error("Error clearing cart on backend:", error);
    throw error;
  }
};

/**
 * Merge local cart with backend cart
 * Used when guest logs in - merges their local cart with server cart
 * @param {Array} localItems - Items from localStorage
 * @returns {Promise<Array>} Merged cart items
 */
export const mergeCart = async (localItems) => {
  try {
    // Get backend cart
    const backendItems = await getCart();
    
    // Create a map of backend items by SKU
    const backendMap = new Map();
    backendItems.forEach(item => {
      backendMap.set(String(item.sku), item);
    });
    
    // Merge local items with backend items
    const merged = [...backendItems];
    
    localItems.forEach(localItem => {
      const sku = String(localItem.sku);
      if (backendMap.has(sku)) {
        // Item exists in both - use backend quantity (or sum them)
        const backendItem = backendMap.get(sku);
        // Option 1: Use backend quantity (server is source of truth)
        // Option 2: Sum quantities
        const existingIndex = merged.findIndex(item => String(item.sku) === sku);
        if (existingIndex >= 0) {
          // Sum quantities
          merged[existingIndex].qty = Math.min(99, merged[existingIndex].qty + localItem.qty);
        }
      } else {
        // Item only in local cart - add to backend
        merged.push(localItem);
        // Also add to backend via API
        addCartItem(localItem).catch(err => {
          console.error("Failed to sync local item to backend:", err);
        });
      }
    });
    
    return merged;
  } catch (error) {
    console.error("Error merging cart:", error);
    // If merge fails, return local items
    return localItems;
  }
};

