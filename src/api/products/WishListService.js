import API from "../../axios";

/**
 * Get wishlist from backend API
 * GET /api/v1/products/wishlist/?page=1
 * Returns: { count, next, previous, results: [ { id, products: [...] } ] }
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<Object>} Wishlist data with pagination
 */
export const getWishlist = async (page = 1) => {
  try {
    const response = await API.get("/v1/products/wishlist/", {
      params: { page },
    });
    
    // API returns: { count, next, previous, results: [ { id, products: [...] } ] }
    return response.data;
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    
    // If unauthorized (401), return empty wishlist (guest mode)
    if (error.response?.status === 401) {
      console.log("User not authenticated, returning empty wishlist");
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    }
    
    throw error;
  }
};

/**
 * Add product to wishlist
 * POST /api/v1/products/wishlist/?id={product_id}
 * Note: API expects `id` as a query parameter, not in request body
 * @param {Object|number|string} payload - Product to add (can be object with id or just the id)
 * @param {number|string} [payload.id] - Product ID (if payload is object)
 * @param {number|string} [payload.product_id] - Product ID (alternative)
 * @param {number|string} [payload.productId] - Product ID (alternative)
 * @returns {Promise<Object>} Response: { id, products: [...] }
 */
export const addToWishlist = async (payload) => {
  try {
    // Extract product ID from payload
    // Payload can be: { id: 123 }, { product_id: 123 }, or just 123
    const productId = 
      typeof payload === 'object' 
        ? (payload.id || payload.product_id || payload.productId)
        : payload;
    
    if (!productId) {
      throw new Error("Product ID is required to add to wishlist");
    }
    
    // API expects `id` as a query parameter
    const response = await API.post("/v1/products/wishlist/", {}, {
      params: {
        id: productId
      }
    });
    
    // Response format: { id: 0, products: [...] }
    return response.data;
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    
    // Handle authentication error
    if (error.response?.status === 401) {
      throw new Error("Authentication required. Please log in to add items to wishlist.");
    }
    
    throw error;
  }
};

/**
 * Remove product from wishlist
 * DELETE /api/v1/products/wishlist/{id}/
 * @param {number|string} wishlistItemId - Wishlist item ID
 * @returns {Promise<Object>} Response from API
 */
export const removeFromWishlist = async (wishlistItemId) => {
  try {
    const response = await API.delete(`/v1/products/wishlist/${wishlistItemId}/`);
    return response.data;
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    
    // Handle authentication error
    if (error.response?.status === 401) {
      throw new Error("Authentication required. Please log in to remove items from wishlist.");
    }
    
    throw error;
  }
};
