import API from "../../axios";
import { normalizeProductResponse } from "../../utils/productNormalization";

/**
 * Get Top Selling Products
 * GET /api/v1/products/top-selling/?page=1
 */
export const getTopSellingProducts = async (page = 1) => {
  try {
    const response = await API.get("/api/v1/products/top-selling/", {
      params: { page }, // ?page=1
    });
    return normalizeProductResponse(response.data); // { count, next, previous, results: [...] }
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    throw error;
  }
};