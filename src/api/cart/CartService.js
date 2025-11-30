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
  console.log("[CartService] getCart() - Starting to fetch cart from backend");
  try {
    console.log("[CartService] getCart() - Making API call to /v1/orders/cart/");
    const response = await API.get("/v1/orders/cart/");
    console.log("[CartService] getCart() - API Response:", response);
    console.log("[CartService] getCart() - Response data:", response.data);
    console.log("[CartService] getCart() - Response data type:", typeof response.data);
    console.log("[CartService] getCart() - Response.data.data:", response.data?.data);
    
    // Backend returns: { data: [...], summary: {...} }
    // Handle different response formats
    let items = [];
    if (response.data?.data && Array.isArray(response.data.data)) {
      items = response.data.data;
      console.log("[CartService] getCart() - Using response.data.data, found", items.length, "items");
    } else if (Array.isArray(response.data)) {
      items = response.data;
      console.log("[CartService] getCart() - Using response.data (array), found", items.length, "items");
    } else if (response.data?.results && Array.isArray(response.data.results)) {
      items = response.data.results;
      console.log("[CartService] getCart() - Using response.data.results, found", items.length, "items");
    } else if (response.data?.items && Array.isArray(response.data.items)) {
      items = response.data.items;
      console.log("[CartService] getCart() - Using response.data.items, found", items.length, "items");
    } else {
      console.warn("[CartService] getCart() - No items found in response, using empty array");
    }
    
    console.log("[CartService] getCart() - Raw items from API:", items);
    
    // Transform backend format to frontend format
    // Backend structure: { id, item: { ...variation data... }, quantity }
    // item contains the ProductVariation with nested product data
    const transformedItems = items.map((item, index) => {
      console.log(`[CartService] getCart() - Transforming item ${index}:`, item);
      // Backend uses 'item' field for the ProductVariation
      const variation = item.item || item.product_variation || item.variation || {};
      const product = variation.product || item.product || {};
      
      // Extract images from variation
      const images = variation.product_images || [];
      const firstImage = images[0]?.product_image || images[0]?.image || null;
      
      // Get price from variation (discounted price is calculated, use final_price or product_price)
      // Backend provides get_discounted_price() method result
      const variationPrice = variation.get_discounted_price?.final_price || 
                            variation.get_discounted_price || 
                            variation.product_price || 
                            variation.price;
      const price = parseFloat(variationPrice || item.price || item.product_price || product.price || 0);
      
      // Extract variation ID (this is the item_id used in API)
      const variationId = variation.id || item.item_id || item.product_id;
      
      const transformed = {
        id: item.id || item.cart_item_id, // Backend cart item ID (needed for update/delete)
        sku: String(variationId || item.item_id || item.sku || item.id), // Variation ID as string for consistency
        title: product.product_name || item.product_name || variation.product_name || item.title || item.name || "Unknown Product",
        price: price,
        qty: parseInt(item.quantity || item.qty || 1, 10),
        image: firstImage || item.image || item.product_image || product.image || item.thumbnail || "/images/NO_IMG.png",
      };
      console.log(`[CartService] getCart() - Transformed item ${index}:`, transformed);
      return transformed;
    });
    
    console.log("[CartService] getCart() - Final transformed items:", transformedItems);
    console.log("[CartService] getCart() - Returning", transformedItems.length, "items");
    return transformedItems;
  } catch (error) {
    console.error("[CartService] getCart() - ERROR fetching cart from backend:", error);
    console.error("[CartService] getCart() - Error response:", error.response);
    console.error("[CartService] getCart() - Error status:", error.response?.status);
    // Return empty array if unauthorized or error
    if (error.response?.status === 401) {
      console.warn("[CartService] getCart() - Unauthorized - user not logged in, using local cart");
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
  console.log("[CartService] addCartItem() - Called with item:", item);
  try {
    // Validate input
    const variationId = parseInt(item.sku, 10);
    const quantity = parseInt(item.qty || 1, 10);
    
    console.log("[CartService] addCartItem() - Parsed variationId:", variationId, "quantity:", quantity);
    
    if (isNaN(variationId) || variationId <= 0) {
      console.error("[CartService] addCartItem() - Invalid variation ID:", item.sku);
      throw new Error(`Invalid variation ID: ${item.sku}`);
    }
    
    if (isNaN(quantity) || quantity <= 0) {
      console.error("[CartService] addCartItem() - Invalid quantity:", item.qty);
      throw new Error(`Invalid quantity: ${item.qty}`);
    }
    
    // API expects: { items: [{ item_id: <variation_id>, quantity: <qty> }] }
    const requestPayload = {
      items: [
        {
          item_id: variationId, // item_id is the variation ID
          quantity: quantity,
        }
      ]
    };
    console.log("[CartService] addCartItem() - Sending POST request to /v1/orders/cart/ with payload:", requestPayload);
    
    const response = await API.post("/v1/orders/cart/", requestPayload);
    console.log("[CartService] addCartItem() - POST response:", response);
    console.log("[CartService] addCartItem() - POST response.data:", response.data);
    
    // Backend only returns {"detail": "Product Added to cart!"}
    // Fetch the full cart to get the updated item with complete product data
    console.log("[CartService] addCartItem() - Fetching full cart to find added item...");
    const cartItems = await getCart();
    console.log("[CartService] addCartItem() - Fetched cart items:", cartItems);
    console.log("[CartService] addCartItem() - Looking for item with variationId:", variationId);
    
    // Find the item we just added by matching variation ID (sku)
    // Match by exact variation ID to avoid matching wrong items
    const addedItem = cartItems.find(cartItem => {
      const cartVariationId = parseInt(cartItem.sku, 10);
      const matches = !isNaN(cartVariationId) && cartVariationId === variationId;
      console.log(`[CartService] addCartItem() - Checking cartItem sku:${cartItem.sku} (parsed:${cartVariationId}) matches ${variationId}:`, matches);
      return matches;
    });
    
    if (addedItem) {
      console.log("[CartService] addCartItem() - Found added item in cart:", addedItem);
      return addedItem;
    }
    
    // If item not found in cart, it might have failed to add
    // Return the item we sent as fallback (with local data)
    console.warn(`[CartService] addCartItem() - Item with variation ID ${variationId} not found in cart after adding. Using local data.`);
    const fallbackItem = {
      id: `temp-${variationId}`, // Temporary ID
      sku: String(variationId),
      title: item.title || "Unknown Product",
      price: item.price || 0,
      qty: quantity,
      image: item.image || "/images/NO_IMG.png",
    };
    console.log("[CartService] addCartItem() - Returning fallback item:", fallbackItem);
    return fallbackItem;
  } catch (error) {
    console.error("[CartService] addCartItem() - ERROR adding item to backend cart:", error);
    console.error("[CartService] addCartItem() - Error response:", error.response);
    console.error("[CartService] addCartItem() - Error status:", error.response?.status);
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
  console.log("[CartService] reduceCartItem() - Called with variationId:", variationId, "reduceBy:", reduceBy);
  try {
    const varId = parseInt(variationId, 10);
    const reduceQty = parseInt(reduceBy, 10);
    console.log("[CartService] reduceCartItem() - Parsed variationId:", varId, "reduceBy:", reduceQty);
    
    const requestPayload = {
      item_id: varId, // item_id is the variation ID
      quantity: reduceQty,
    };
    console.log("[CartService] reduceCartItem() - Sending PUT request to /v1/orders/cart/reduce/ with payload:", requestPayload);
    
    const response = await API.put("/v1/orders/cart/reduce/", requestPayload);
    console.log("[CartService] reduceCartItem() - PUT response:", response);
    console.log("[CartService] reduceCartItem() - PUT response.data:", response.data);
    
    // Response format: { item_id: <variation_id>, quantity: <reduced_by> }
    console.log("[CartService] reduceCartItem() - Returning response data:", response.data);
    return response.data;
  } catch (error) {
    console.error("[CartService] reduceCartItem() - ERROR reducing cart item on backend:", error);
    console.error("[CartService] reduceCartItem() - Error response:", error.response);
    console.error("[CartService] reduceCartItem() - Error status:", error.response?.status);
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
  console.log("[CartService] updateCartItem() - Called with itemId:", itemId, "qty:", qty, "currentQty:", currentQty, "variationId:", variationId);
  try {
    // Validate inputs
    const newQty = parseInt(qty, 10);
    console.log("[CartService] updateCartItem() - Parsed newQty:", newQty);
    
    if (isNaN(newQty) || newQty < 1) {
      console.error("[CartService] updateCartItem() - Invalid quantity:", qty);
      throw new Error(`Invalid quantity: ${qty}`);
    }
    
    // Use variation ID for reduce endpoint (item_id in API)
    const varId = variationId || itemId;
    const varIdInt = parseInt(varId, 10);
    console.log("[CartService] updateCartItem() - Using variationId:", varIdInt);
    
    if (isNaN(varIdInt) || varIdInt <= 0) {
      console.error("[CartService] updateCartItem() - Invalid variation ID:", varId);
      throw new Error(`Invalid variation ID: ${varId}`);
    }
    
    // If we have current quantity and new qty is less, use reduce endpoint
    if (currentQty !== null && newQty < currentQty) {
      const reduceBy = currentQty - newQty;
      console.log("[CartService] updateCartItem() - Decreasing quantity, reducing by:", reduceBy);
      await reduceCartItem(varIdInt, reduceBy);
      // Fetch updated cart to get the new state with complete data
      console.log("[CartService] updateCartItem() - Fetching cart after reduce...");
      const cart = await getCart();
      const updatedItem = cart.find(item => {
        const itemVarId = parseInt(item.sku, 10);
        const matches = !isNaN(itemVarId) && itemVarId === varIdInt;
        console.log(`[CartService] updateCartItem() - Checking item sku:${item.sku} (parsed:${itemVarId}) matches ${varIdInt}:`, matches);
        return matches;
      });
      if (updatedItem) {
        console.log("[CartService] updateCartItem() - Found updated item after reduce:", updatedItem);
        return updatedItem;
      }
      console.warn("[CartService] updateCartItem() - Item not found in cart after reduce");
    }
    
    // For increases or if no current qty, try PATCH endpoint
    // Note: This endpoint might not exist, so we'll handle the error gracefully
    try {
      const cartItemId = parseInt(itemId, 10);
      console.log("[CartService] updateCartItem() - Parsed cartItemId:", cartItemId);
      
      if (isNaN(cartItemId) || cartItemId <= 0) {
        console.error("[CartService] updateCartItem() - Invalid cart item ID:", itemId);
        throw new Error(`Invalid cart item ID: ${itemId}`);
      }
      
      const requestPayload = { quantity: newQty };
      console.log("[CartService] updateCartItem() - Sending PATCH request to /v1/orders/cart/" + cartItemId + "/ with payload:", requestPayload);
      
      const response = await API.patch(`/v1/orders/cart/${cartItemId}/`, requestPayload);
      console.log("[CartService] updateCartItem() - PATCH response:", response);
      console.log("[CartService] updateCartItem() - PATCH response.data:", response.data);
      
      // Transform response to frontend format
      const backendItem = response.data;
      const variation = backendItem.item || backendItem.product_variation || {};
      const product = variation.product || backendItem.product || {};
      const images = variation.product_images || [];
      const firstImage = images[0]?.product_image || images[0]?.image || null;
      const variationPrice = variation.get_discounted_price?.final_price || 
                            variation.get_discounted_price || 
                            variation.product_price || 
                            variation.price;
      
      const transformed = {
        id: backendItem.id || backendItem.cart_item_id,
        sku: String(variation.id || backendItem.item_id || varIdInt),
        title: product.product_name || backendItem.product_name || "Unknown Product",
        price: parseFloat(variationPrice || backendItem.price || 0),
        qty: parseInt(backendItem.quantity || backendItem.qty || newQty, 10),
        image: firstImage || backendItem.image || "/images/NO_IMG.png",
      };
      console.log("[CartService] updateCartItem() - Transformed item from PATCH:", transformed);
      return transformed;
    } catch (patchError) {
      console.warn("[CartService] updateCartItem() - PATCH failed, trying fallback:", patchError);
      // If PATCH doesn't work and we're increasing, fetch cart to get updated state
      if (currentQty !== null && newQty > currentQty) {
        console.log("[CartService] updateCartItem() - Fetching cart after PATCH failure (increasing)...");
        const cart = await getCart();
        const updatedItem = cart.find(item => {
          const itemVarId = parseInt(item.sku, 10);
          return !isNaN(itemVarId) && itemVarId === varIdInt;
        });
        if (updatedItem) {
          console.log("[CartService] updateCartItem() - Found updated item in cart:", updatedItem);
          return updatedItem;
        }
      }
      console.error("[CartService] updateCartItem() - PATCH error:", patchError);
      throw patchError;
    }
  } catch (error) {
    console.error("[CartService] updateCartItem() - ERROR updating cart item on backend:", error);
    console.error("[CartService] updateCartItem() - Error response:", error.response);
    console.error("[CartService] updateCartItem() - Error status:", error.response?.status);
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
  console.log("[CartService] removeCartItem() - Called with variationId:", variationId);
  try {
    // Validate variation ID
    const varId = parseInt(variationId, 10);
    console.log("[CartService] removeCartItem() - Parsed variationId:", varId);
    
    if (isNaN(varId) || varId <= 0) {
      console.error("[CartService] removeCartItem() - Invalid variation ID:", variationId);
      throw new Error(`Invalid variation ID: ${variationId}`);
    }
    
    // API expects item_id (variation ID) in request body
    const requestPayload = { item_id: varId };
    console.log("[CartService] removeCartItem() - Sending DELETE request to /v1/orders/cart/remove/ with payload:", requestPayload);
    
    const response = await API.delete("/v1/orders/cart/remove/", {
      data: requestPayload
    });
    console.log("[CartService] removeCartItem() - DELETE response:", response);
    console.log("[CartService] removeCartItem() - DELETE response.data:", response.data);
    console.log("[CartService] removeCartItem() - Item removed successfully");
  } catch (error) {
    console.error("[CartService] removeCartItem() - ERROR removing cart item from backend:", error);
    console.error("[CartService] removeCartItem() - Error response:", error.response);
    console.error("[CartService] removeCartItem() - Error status:", error.response?.status);
    throw error;
  }
};

/**
 * Clear entire cart on backend
 * DELETE /api/v1/orders/cart/remove/
 * @returns {Promise<void>}
 */
export const clearCartBackend = async () => {
  console.log("[CartService] clearCartBackend() - Called to clear entire cart");
  try {
    console.log("[CartService] clearCartBackend() - Sending DELETE request to /v1/orders/cart/remove/");
    const response = await API.delete("/v1/orders/cart/remove/");
    console.log("[CartService] clearCartBackend() - DELETE response:", response);
    console.log("[CartService] clearCartBackend() - Cart cleared successfully");
  } catch (error) {
    console.error("[CartService] clearCartBackend() - ERROR clearing cart on backend:", error);
    console.error("[CartService] clearCartBackend() - Error response:", error.response);
    console.error("[CartService] clearCartBackend() - Error status:", error.response?.status);
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
  console.log("[CartService] mergeCart() - Called with localItems:", localItems);
  console.log("[CartService] mergeCart() - Local items count:", localItems.length);
  try {
    // Get backend cart
    console.log("[CartService] mergeCart() - Fetching backend cart...");
    const backendItems = await getCart();
    console.log("[CartService] mergeCart() - Backend items:", backendItems);
    console.log("[CartService] mergeCart() - Backend items count:", backendItems.length);
    
    // Create a map of backend items by SKU
    const backendMap = new Map();
    backendItems.forEach(item => {
      backendMap.set(String(item.sku), item);
      console.log(`[CartService] mergeCart() - Added to backendMap: sku=${item.sku}`, item);
    });
    console.log("[CartService] mergeCart() - Backend map size:", backendMap.size);
    
    // Merge local items with backend items
    const merged = [...backendItems];
    console.log("[CartService] mergeCart() - Starting with backend items:", merged);
    
    localItems.forEach((localItem, index) => {
      const sku = String(localItem.sku);
      console.log(`[CartService] mergeCart() - Processing local item ${index}: sku=${sku}`, localItem);
      
      if (backendMap.has(sku)) {
        // Item exists in both - use backend quantity (or sum them)
        const backendItem = backendMap.get(sku);
        console.log(`[CartService] mergeCart() - Item ${sku} exists in both. Backend:`, backendItem, "Local:", localItem);
        
        // Option 1: Use backend quantity (server is source of truth)
        // Option 2: Sum quantities
        const existingIndex = merged.findIndex(item => String(item.sku) === sku);
        if (existingIndex >= 0) {
          // Sum quantities
          const oldQty = merged[existingIndex].qty;
          merged[existingIndex].qty = Math.min(99, merged[existingIndex].qty + localItem.qty);
          console.log(`[CartService] mergeCart() - Updated quantity for ${sku}: ${oldQty} + ${localItem.qty} = ${merged[existingIndex].qty}`);
        }
      } else {
        // Item only in local cart - add to backend
        console.log(`[CartService] mergeCart() - Item ${sku} only in local cart, adding to merged and backend`);
        merged.push(localItem);
        // Also add to backend via API
        addCartItem(localItem).catch(err => {
          console.error("[CartService] mergeCart() - Failed to sync local item to backend:", err);
        });
      }
    });
    
    console.log("[CartService] mergeCart() - Final merged cart:", merged);
    console.log("[CartService] mergeCart() - Merged items count:", merged.length);
    return merged;
  } catch (error) {
    console.error("[CartService] mergeCart() - ERROR merging cart:", error);
    console.error("[CartService] mergeCart() - Error response:", error.response);
    // If merge fails, return local items
    console.log("[CartService] mergeCart() - Returning local items as fallback");
    return localItems;
  }
};

