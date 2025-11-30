import API from "../../axios";

/**
 * Get most sold products from backend API
 * GET /api/v1/products/most-sold-product/
 * Returns: { data: [...] } - Array of most sold products
 * @returns {Promise<Array>} Most sold products data
 */
export const getMostSoldProducts = async () => {
  try {
    const response = await API.get("/v1/products/most-sold-product/");
    
    // API returns: { data: [...] } or array directly
    const products = Array.isArray(response.data?.data) ? response.data.data : 
                    Array.isArray(response.data) ? response.data : [];
    
    return products;
  } catch (error) {
    console.error("Error fetching most sold products:", error);
    
    // Return empty array on error (don't break the page)
    return [];
  }
};
