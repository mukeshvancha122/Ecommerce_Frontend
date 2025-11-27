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
    const response = await API.post("/v1/products/search/image/", formData, {
      params: { page, page_size },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Handle different response structures
    const responseData = response.data;
    let products = [];

    if (responseData?.results) {
      if (Array.isArray(responseData.results)) {
        products = responseData.results;
      } else if (responseData.results?.data && Array.isArray(responseData.results.data)) {
        products = responseData.results.data;
      }
    }

    return {
      count: responseData?.count || products.length,
      next: responseData?.next || null,
      previous: responseData?.previous || null,
      results: products,
    };
  } catch (error) {
    console.error("Error searching products by image:", error);
    throw error;
  }
};