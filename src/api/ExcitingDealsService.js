import API from "../../axios";

/**
 * Get Exciting Deals
 * GET /api/v1/products/exciting-deals/?page=1
 */
export const getExcitingDeals = async (page = 1) => {
  try {
    const response = await API.get(`/api/v1/products/exciting-deals/`, {
      params: { page } // ?page=1
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching exciting deals:", error);
    throw error;
  }
};
