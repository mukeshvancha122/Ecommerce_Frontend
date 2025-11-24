import { translateProduct } from "../../../utils/productTranslations";
import { normalizeProduct } from "../../../utils/productNormalization";
import API from "../../../axios";

/**
 * Search products
 * GET /api/v1/products/search-product-view/
 */
export const searchProducts = async (filters = {}) => {
  const response = await API.get("/api/v1/products/search-product-view/", {
    params: {
      attributes: filters.attributes,
      brand: filters.brand,
      category: filters.category,
      free_delivery: filters.free_delivery,
      handpicked: filters.handpicked,
      in_stock: filters.in_stock,
      max_price: filters.max_price,
      min_price: filters.min_price,
      page: filters.page,
      page_size: filters.page_size,
      product_name: filters.product_name,
      products: filters.products,
      ratings: filters.ratings
    }
  });

  const data = response.data;
  
  if (data?.results) {
    if (data.results.data && Array.isArray(data.results.data)) {
      const normalizedData = {
        ...data,
        results: data.results.data.map(product => normalizeProduct(translateProduct(product))),
        brands: data.results.brands || [],
        attributes: data.results.attributes || {}
      };
      return normalizedData;
    }
    if (Array.isArray(data.results)) {
      data.results = data.results.map(product => normalizeProduct(translateProduct(product)));
    }
  }
  return data; 
};
