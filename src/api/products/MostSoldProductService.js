import API from "../../axios";
import { translateProduct } from "../../utils/productTranslations";
import { normalizeProduct } from "../../utils/productNormalization";

/**
 * Get most sold products
 * GET /api/v1/products/most-sold-product/
 */
export const getMostSoldProducts = async () => {
  try {
    const response = await API.get("/api/v1/products/most-sold-product/");
    const data = response.data;
    // Translate and normalize products
    if (Array.isArray(data)) {
      return data.map(product => normalizeProduct(translateProduct(product)));
    }
    // If response is paginated
    if (data?.results && Array.isArray(data.results)) {
      return {
        ...data,
        results: data.results.map(product => normalizeProduct(translateProduct(product)))
      };
    }
    // Handle results.data structure
    if (data?.results?.data && Array.isArray(data.results.data)) {
      return {
        ...data,
        results: data.results.data.map(product => normalizeProduct(translateProduct(product)))
      };
    }
    return data;
  } catch (error) {
    console.error("Error fetching most sold products:", error);
    throw error;
  }
};
