import API from "../../../axios";
import { translateProduct } from "../../../utils/productTranslations";
import { getIntelligentSearchStrategy } from "../../../utils/searchIntelligence";

/**
 * Intelligent search with fallback to related categories
 * @param {Object} filters - Search filters
 * @param {string} filters.product_name - Prodelected categoryuct name to search
 * @param {string} filters.category - S
 * @param {boolean} filters.useIntelligentSearch - Whether to use intelligent search (default: true)
 * @returns {Promise<Object>} Search results with fallback suggestions
 */
export const searchProducts = async (filters = {}) => {
  try {
    const useIntelligentSearch = filters.useIntelligentSearch !== false;
    const query = filters.product_name || "";
    
    // Build query parameters for primary search
    const params = {};
    
    if (query) params.product_name = query;
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

    // Try primary search
    let response = await API.get("/v1/products/search-product-view/", { params });
    let responseData = response.data;
    let products = [];

    if (responseData?.results) {
      if (Array.isArray(responseData.results)) {
        products = responseData.results;
      } else if (responseData.results?.data && Array.isArray(responseData.results.data)) {
        products = responseData.results.data;
      }
    }

    // If no results and intelligent search is enabled, try category-based search
    if (products.length === 0 && useIntelligentSearch && query) {
      const strategy = getIntelligentSearchStrategy(query, filters.category);
      
      // Try primary category from strategy
      if (strategy.primaryCategory) {
        try {
          const categoryParams = { ...params };
          categoryParams.category = strategy.primaryCategory;
          // Remove product_name to get all products in category
          delete categoryParams.product_name;
          
          const categoryResponse = await API.get("/v1/products/search-product-view/", { 
            params: categoryParams 
          });
          
          const categoryData = categoryResponse.data;
          if (categoryData?.results) {
            if (Array.isArray(categoryData.results)) {
              products = categoryData.results;
            } else if (categoryData.results?.data && Array.isArray(categoryData.results.data)) {
              products = categoryData.results.data;
            }
          }
          
          // If we found products, add a note that these are related products
          if (products.length > 0) {
            console.log(`Found ${products.length} related products in ${strategy.primaryCategory} category`);
          }
        } catch (categoryError) {
          console.warn("Category-based search failed:", categoryError);
        }
      }
      
      // If still no results, try fallback categories
      if (products.length === 0 && strategy.fallbackCategories.length > 0) {
        for (const fallbackCategory of strategy.fallbackCategories.slice(0, 2)) {
          try {
            const fallbackParams = { ...params };
            fallbackParams.category = fallbackCategory;
            delete fallbackParams.product_name;
            
            const fallbackResponse = await API.get("/v1/products/search-product-view/", { 
              params: fallbackParams 
            });
            
            const fallbackData = fallbackResponse.data;
            if (fallbackData?.results) {
              let fallbackProducts = [];
              if (Array.isArray(fallbackData.results)) {
                fallbackProducts = fallbackData.results;
              } else if (fallbackData.results?.data && Array.isArray(fallbackData.results.data)) {
                fallbackProducts = fallbackData.results.data;
              }
              
              if (fallbackProducts.length > 0) {
                products = fallbackProducts;
                console.log(`Found ${products.length} related products in ${fallbackCategory} category`);
                break;
              }
            }
          } catch (fallbackError) {
            console.warn(`Fallback search for ${fallbackCategory} failed:`, fallbackError);
          }
        }
      }
    }

    // Translate products based on current language
    const translatedResults = products.map(translateProduct);

    return {
      count: responseData?.count || translatedResults.length,
      next: responseData?.next || null,
      previous: responseData?.previous || null,
      results: translatedResults,
      searchStrategy: useIntelligentSearch ? getIntelligentSearchStrategy(query, filters.category) : null,
    };
  } catch (error) {
    console.error("Error searching products:", error);
    // Return empty results on error - let the UI handle it
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
      searchStrategy: null,
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