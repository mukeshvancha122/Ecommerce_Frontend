import API from "../../axios";

/**
 * Get sale categories
 * GET /api/v1/products/sale-category-view/
 */
export const getSaleCategories = async () => {
  try {
    const response = await API.get("/api/v1/products/sale-category-view/");
    return response.data; // returns array
  } catch (error) {
    console.error("Error fetching sale categories:", error);
    throw error;
  }
};