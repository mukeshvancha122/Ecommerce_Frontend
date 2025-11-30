import API from "../axios";

/**
 * Get exciting deals from backend API
 * GET /api/v1/products/exciting-deals/?page=1
 * Returns: { data: [...] } - Array of products with exciting_deals flag
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<Object>} Exciting deals data
 */
export const getExcitingDeals = async (page = 1) => {
  try {
    const response = await API.get("/v1/products/exciting-deals/", {
      params: { page },
    });
    
    // API returns: { data: [...] }
    // Transform to match expected format
    const products = Array.isArray(response.data?.data) ? response.data.data : 
                    Array.isArray(response.data) ? response.data : [];
    
    return {
      data: products,
      count: products.length,
    };
  } catch (error) {
    console.error("Error fetching exciting deals:", error);
    
    // Return empty array on error (don't break the page)
    return {
      data: [],
      count: 0,
    };
  }
};
