import API from "../../axios";
import { normalizeProductResponse } from "../../utils/productNormalization";

/**
 * Get Featured Products
 * GET /api/v1/products/featured-product/?page=1
 */
export const getFeaturedProducts = async (page = 1) => {
  try {
    const response = await API.get("/api/v1/products/featured-product/", {
      params: { page } // Adds ?page=1
    });
    return normalizeProductResponse(response.data);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    throw error;
  }
};
