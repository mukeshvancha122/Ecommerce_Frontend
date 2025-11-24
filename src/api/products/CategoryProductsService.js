import { searchProducts } from "./searchProduct/SearchProductService";

const PAGE_SIZE = 8;

/**
 * Get products by category slug
 * Uses search-product-view API with category filter
 */
export const getProductsByCategory = async (categorySlug, page = 1) => {
  try {
    const response = await searchProducts({
      category: categorySlug,
      page,
      page_size: PAGE_SIZE,
    });
    return response;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
};

/**
 * Get products by subcategory slug
 * Uses search-product-view API with subcategory filter
 */
export const getProductsBySubcategory = async (subcategorySlug, page = 1) => {
  try {
    // Note: The API might use 'sub_category' or 'category' parameter
    // Adjust based on your backend API structure
    const response = await searchProducts({
      category: subcategorySlug, // or sub_category: subcategorySlug if backend supports it
      page,
      page_size: PAGE_SIZE,
    });
    return response;
  } catch (error) {
    console.error("Error fetching products by subcategory:", error);
    throw error;
  }
};

/**
 * Get all products (paginated)
 * Uses search-product-view API without filters
 */
export const getAllProducts = async (page = 1) => {
  try {
    const response = await searchProducts({
      page,
      page_size: PAGE_SIZE,
    });
    return response;
  } catch (error) {
    console.error("Error fetching all products:", error);
    throw error;
  }
};
