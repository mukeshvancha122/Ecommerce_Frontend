import API from "../../axios";

/**
 * Add Product Query
 * POST /api/v1/products/add-query/
 */
export const addProductQuery = async (payload) => {
  const response = await API.post("/api/v1/products/add-query/", payload);
  return response.data;
};
