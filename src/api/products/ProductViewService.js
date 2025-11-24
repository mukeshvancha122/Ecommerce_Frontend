import API from "../../axios";
import { translateProduct } from "../../utils/productTranslations";
import { normalizeProduct } from "../../utils/productNormalization";

/**
 * Get Product View
 * GET /api/v1/products/product-view/?id=1&slug=product-slug
 */
export const getProductView = async (id, slug) => {
  try {
    const response = await API.get("/api/v1/products/product-view/", {
      params: { id, slug }
    });
    const products = response.data;
    // Translate and normalize products based on current language
    if (Array.isArray(products)) {
      return products.map(product => normalizeProduct(translateProduct(product)));
    }
    // Handle single product object
    if (products && typeof products === 'object') {
      return normalizeProduct(translateProduct(products));
    }
    return products;
  } catch (error) {
    console.error("Error fetching product view:", error);
    throw error;
  }
};
