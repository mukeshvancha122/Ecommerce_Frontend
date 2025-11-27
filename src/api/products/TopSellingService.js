import API from "../../axios";

// GET /api/v1/products/top-selling/?page=1
export const getTopSellingProducts = async (page = 1) => {
  try {
    const response = await API.get("/v1/products/top-selling/", {
      params: { page },
    });
    // Handle different response structures
    if (response.data?.results) {
      return response.data.results;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    // Fallback: return empty array instead of throwing
    return [];
  }
};