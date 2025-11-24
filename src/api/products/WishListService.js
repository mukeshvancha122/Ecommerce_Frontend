import API from "../../axios";

/**
 * Get Wishlist
 * GET /api/v1/products/wishlist/?page=1
 * Returns: { count, next, previous, results: [ { id, products: [...] } ] }
 */
export const getWishlist = async (page = 1) => {
  try {
    const response = await API.get("/api/v1/products/wishlist/", {
      params: { page },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    throw error;
  }
};

/**
 * Add to Wishlist
 * POST /api/v1/products/wishlist/
 * Payload shape depends on your backend (e.g. { product_id: 1 } or similar)
 */
export const addToWishlist = async (payload) => {
  try {
    const response = await API.post("/api/v1/products/wishlist/", payload);
    return response.data;
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    throw error;
  }
};
