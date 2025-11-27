import API from "../../axios";

// GET: /api/v1/products/featured-product/?page=1
export const getFeaturedProducts = async (page = 1) => {
  try {
    const response = await API.get("/v1/products/featured-product/", {
      params: { page }
    });
    // API returns { data: [...] } format
    // Handle both nested data and direct array responses
    let products = [];
    if (Array.isArray(response.data)) {
      products = response.data;
    } else if (Array.isArray(response.data?.data)) {
      products = response.data.data;
    } else if (Array.isArray(response.data?.results)) {
      products = response.data.results;
    }
    
    return {
      data: products,
      count: products.length
    };
  } catch (error) {
    console.error("Error fetching featured products:", error);
    throw error;
  }
};
