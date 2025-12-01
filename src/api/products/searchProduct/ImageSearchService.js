import API from "../../../axios";

/**
 * Search products by image.
 * @param {Object} options
 * @param {File|string} options.image  - File object (from input) OR image URL string.
 * @param {number} [options.page=1]
 * @param {number} [options.page_size=10]
 */
export const searchProductsByImage = async ({ image, page = 1, page_size = 10 }) => {
  const formData = new FormData();

  // If it's a File, send it directly. If it's a string (URL), we might need to fetch it first
  if (image instanceof File) {
    formData.append("image", image);
  } else if (typeof image === "string") {
    // If it's a URL string, try to fetch and convert to blob, or send as URL
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const file = new File([blob], "image.jpg", { type: blob.type });
      formData.append("image", file);
    } catch (error) {
      console.error("Error converting image URL to file:", error);
      formData.append("image", image);
    }
  } else {
    formData.append("image", image);
  }

  try {
    // Log the actual URL being called (baseURL + endpoint)
    const endpoint = "/v1/products/search/image/";
    const fullUrl = API.defaults.baseURL 
      ? `${API.defaults.baseURL}${endpoint}` 
      : endpoint;
    console.log("[ImageSearchService] Making request to:", fullUrl);
    console.log("[ImageSearchService] Base URL configured:", API.defaults.baseURL);
    console.log("[ImageSearchService] Request params:", { page, page_size });
    
    const response = await API.post(endpoint, formData, {
      params: { page, page_size },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Handle different response structures
    const responseData = response.data;
    console.log("[ImageSearchService] Raw API response:", JSON.stringify(responseData, null, 2));
    
    let products = [];
    let brands = [];
    let attributes = {};

    if (responseData?.results) {
      // Case 1: results is an array directly
      if (Array.isArray(responseData.results)) {
        products = responseData.results;
        console.log("[ImageSearchService] Results is an array, extracted", products.length, "products");
      } 
      // Case 2: results is an object with data, brands, attributes
      else if (responseData.results?.data && Array.isArray(responseData.results.data)) {
        products = responseData.results.data;
        brands = responseData.results.brands || [];
        attributes = responseData.results.attributes || {};
        console.log("[ImageSearchService] Results is an object with data, extracted", products.length, "products");
        console.log("[ImageSearchService] Brands:", brands);
        console.log("[ImageSearchService] Attributes:", attributes);
      }
      // Case 3: results might be an object but data is not an array (fallback)
      else if (responseData.results && typeof responseData.results === 'object') {
        // Try to find any array property that might contain products
        const possibleDataKeys = ['data', 'products', 'items'];
        for (const key of possibleDataKeys) {
          if (Array.isArray(responseData.results[key])) {
            products = responseData.results[key];
            console.log("[ImageSearchService] Found products in results." + key, products.length, "products");
            break;
          }
        }
      }
    }

    // Fallback: if no products found, check if responseData itself is an array
    if (products.length === 0 && Array.isArray(responseData)) {
      products = responseData;
      console.log("[ImageSearchService] Response data is an array, using directly", products.length, "products");
    }

    console.log("[ImageSearchService] Final extracted products:", products.length);
    console.log("[ImageSearchService] Sample product:", products[0] ? {
      id: products[0].id,
      name: products[0].product_name,
      variations: products[0].product_variations?.length || 0,
    } : "No products");

    return {
      count: responseData?.count || products.length,
      next: responseData?.next || null,
      previous: responseData?.previous || null,
      results: products,
      brands: brands,
      attributes: attributes,
    };
  } catch (error) {
    console.error("[ImageSearchService] Error searching products by image:", error);
    console.error("[ImageSearchService] Error response:", error.response?.data);
    throw error;
  }
};