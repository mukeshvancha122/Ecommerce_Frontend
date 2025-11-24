import API from "../../../axios";

/**
 * Get Top Reviews
 * GET /api/v1/products/top-review/?product_id=123
 */
export const getTopReviews = async (product_id) => {
  const response = await API.get("/api/v1/products/top-review/", {
    params: { product_id }
  });
  return response.data;
};