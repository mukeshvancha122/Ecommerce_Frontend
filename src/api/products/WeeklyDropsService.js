import API from "../../axios";
import { normalizeProductResponse } from "../../utils/productNormalization";

/**
 * Get Weekly Drops
 * GET /api/v1/products/weekly-drops/?page=1
 */
export const getWeeklyDrops = async (page = 1) => {
  try {
    const response = await API.get("/api/v1/products/weekly-drops/", {
      params: { page }, // ?page=1
    });
    return normalizeProductResponse(response.data); // {count, next, previous, results: [...]}
  } catch (error) {
    console.error("Error fetching weekly drops:", error);
    throw error;
  }
};
