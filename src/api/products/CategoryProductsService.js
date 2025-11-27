import API from "../../axios";
import { translateProduct } from "../../utils/productTranslations";

const PAGE_SIZE = 20;

/**
 * Get products by category slug
 * @param {string} categorySlug - Category slug
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<{count: number, next: string|null, previous: string|null, results: Array}>}
 */
export const getProductsByCategory = async (categorySlug, page = 1) => {
  try {
    const response = await API.get("/v1/products/search-product-view/", {
      params: {
        category: categorySlug,
        page,
        page_size: PAGE_SIZE,
      },
    });

    console.log("CategoryProductsService - Full API Response:", response);
    console.log("CategoryProductsService - response.data:", response.data);
    console.log("CategoryProductsService - response.data type:", typeof response.data);
    console.log("CategoryProductsService - response.data.results:", response.data?.results);
    console.log("CategoryProductsService - Is results array?", Array.isArray(response.data?.results));

    // Handle response format: {count, next, previous, results: {data: [...], brands: [...], attributes: {...}}}
    const responseData = response.data;
    let products = [];

    // Try multiple response formats
    if (responseData?.results) {
      if (Array.isArray(responseData.results)) {
        products = responseData.results;
        console.log("CategoryProductsService - Found products in results array:", products.length);
      } else if (responseData.results?.data && Array.isArray(responseData.results.data)) {
        products = responseData.results.data;
        console.log("CategoryProductsService - Found products in results.data:", products.length);
      } else if (responseData.results?.results && Array.isArray(responseData.results.results)) {
        products = responseData.results.results;
        console.log("CategoryProductsService - Found products in results.results:", products.length);
      }
    } else if (Array.isArray(responseData)) {
      // Sometimes the API returns an array directly
      products = responseData;
      console.log("CategoryProductsService - Response is direct array:", products.length);
    } else if (responseData?.data && Array.isArray(responseData.data)) {
      products = responseData.data;
      console.log("CategoryProductsService - Found products in data:", products.length);
    }

    console.log("CategoryProductsService - Final products count:", products.length);
    console.log("CategoryProductsService - First product:", products[0]);

    // Translate products based on current language
    const translatedResults = products.map(translateProduct);

    return {
      count: responseData?.count || translatedResults.length,
      next: responseData?.next || null,
      previous: responseData?.previous || null,
      results: translatedResults,
    };
  } catch (error) {
    console.error("Error fetching products by category:", error);
    console.error("Error details:", error.response?.data || error.message);
    // Return empty results on error - let the UI handle it
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  }
};

/**
 * Get products by subcategory slug
 * @param {string} subcategorySlug - Subcategory slug
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<{count: number, next: string|null, previous: string|null, results: Array}>}
 */
export const getProductsBySubcategory = async (subcategorySlug, page = 1) => {
  try {
    const response = await API.get("/v1/products/search-product-view/", {
      params: {
        subcategory: subcategorySlug,
        page,
        page_size: PAGE_SIZE,
      },
    });

    // Handle response format: {count, next, previous, results: {data: [...], brands: [...], attributes: {...}}}
    const responseData = response.data;
    let products = [];

    // Try multiple response formats
    if (responseData?.results) {
      if (Array.isArray(responseData.results)) {
        products = responseData.results;
      } else if (responseData.results?.data && Array.isArray(responseData.results.data)) {
        products = responseData.results.data;
      } else if (responseData.results?.results && Array.isArray(responseData.results.results)) {
        products = responseData.results.results;
      }
    } else if (Array.isArray(responseData)) {
      products = responseData;
    } else if (responseData?.data && Array.isArray(responseData.data)) {
      products = responseData.data;
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
    console.error("Error fetching products by subcategory:", error);
    // Return empty results on error - let the UI handle it
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  }
};

/**
 * Get all products (no category filter)
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<{count: number, next: string|null, previous: string|null, results: Array}>}
 */
export const getAllProducts = async (page = 1) => {
  try {
    const response = await API.get("/v1/products/search-product-view/", {
      params: {
        page,
        page_size: PAGE_SIZE,
      },
    });

    // Handle response format: {count, next, previous, results: {data: [...], brands: [...], attributes: {...}}}
    const responseData = response.data;
    let products = [];

    // Try multiple response formats
    if (responseData?.results) {
      if (Array.isArray(responseData.results)) {
        products = responseData.results;
      } else if (responseData.results?.data && Array.isArray(responseData.results.data)) {
        products = responseData.results.data;
      } else if (responseData.results?.results && Array.isArray(responseData.results.results)) {
        products = responseData.results.results;
      }
    } else if (Array.isArray(responseData)) {
      products = responseData;
    } else if (responseData?.data && Array.isArray(responseData.data)) {
      products = responseData.data;
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
    console.error("Error fetching all products:", error);
    // Return empty results on error - let the UI handle it
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  }
};
