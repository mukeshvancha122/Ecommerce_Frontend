import API from "../../../axios";
import { translateProduct } from "../../../utils/productTranslations";

export const searchProducts = async (filters = {}) => {
  try {
    // Build query parameters
    const params = {};
    
    if (filters.product_name) params.product_name = filters.product_name;
    if (filters.products) params.products = filters.products;
    if (filters.category && filters.category !== "all") params.category = filters.category;
    if (filters.brand) {
      if (Array.isArray(filters.brand)) {
        params.brand = filters.brand;
      } else {
        params.brand = [filters.brand];
      }
    }
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price) params.max_price = filters.max_price;
    if (filters.free_delivery !== undefined) params.free_delivery = filters.free_delivery;
    if (filters.handpicked !== undefined) params.handpicked = filters.handpicked;
    if (filters.in_stock !== undefined) params.in_stock = filters.in_stock;
    if (filters.ratings) params.ratings = filters.ratings;
    if (filters.attributes) params.attributes = filters.attributes;
    
    params.page = filters.page || 1;
    params.page_size = filters.page_size || 20;

    const response = await API.get("/v1/products/search-product-view/", { params });

    // Handle response format: {count, next, previous, results: {data: [...], brands: [...], attributes: {...}}}
    const responseData = response.data;
    let products = [];

    if (responseData?.results) {
      if (Array.isArray(responseData.results)) {
        products = responseData.results;
      } else if (responseData.results?.data && Array.isArray(responseData.results.data)) {
        products = responseData.results.data;
      }
    }

    // Translate products based on current language
    const translatedResults = products.map(translateProduct);

    return {
      count: responseData?.count || translatedResults.length,
      next: responseData?.next || null,
      previous: responseData?.previous || null,
      results: translatedResults,
    };
  } catch (error) {
    console.error("Error searching products:", error);
    // Return empty results on error - let the UI handle it
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  }
};

// GET /api/v1/products/search-product-view/
// export const searchProducts = async (filters = {}) => {
//   try {
//     const response = await API.get("/v1/products/search-product-view/", {
//       params: {
//         attributes: filters.attributes,
//         brand: filters.brand,
//         category: filters.category,
//         free_delivery: filters.free_delivery,
//         handpicked: filters.handpicked,
//         in_stock: filters.in_stock,
//         max_price: filters.max_price,
//         min_price: filters.min_price,
//         page: filters.page,
//         page_size: filters.page_size,
//         product_name: filters.product_name,
//         products: filters.products,
//         ratings: filters.ratings
//       }
//     });

//     return response.data; // pagination {count,next,prev,results}
//   } catch (error) {
//     console.error("Error fetching searched products:", error);
//     throw error;
//   }
// };