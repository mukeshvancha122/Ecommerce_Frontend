import API from "../../axios";

/**
 * Get sale category subcategories
 * GET /api/v1/products/sale-category-subcategory-view/
 */
export const getSaleCategorySubcategory = async () => {
  try {
    const response = await API.get("/api/v1/products/sale-category-subcategory-view/");
    return response.data; // array
  } catch (error) {
    console.error("Error fetching sale category-subcategory data:", error);
    throw error;
  }
};
