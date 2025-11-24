import API from "../../../axios";

/**
 * Search products by image.
 * POST /api/v1/products/search/image/
 * 
 * @param {Object} options
 * @param {File|string} options.image  - File object (from input) OR image URL string.
 * @param {number} [options.page=1]
 * @param {number} [options.page_size=10]
 */
export const searchProductsByImage = async ({ image, page = 1, page_size = 10 }) => {
  const formData = new FormData();

  // If it's a File, send it directly. If it's a string, still append as field.
  formData.append("image", image);

  const response = await API.post("/api/v1/products/search/image/", formData, {
    params: { page, page_size },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data; // {count, next, previous, results: [...]}
};