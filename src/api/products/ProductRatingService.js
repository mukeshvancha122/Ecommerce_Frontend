import API from "../../axios";

/**
 * Add Product Rating
 * POST /api/v1/products/product-rating/
 * 
 * Payload example:
 * { 
 *   "review": "Amazing laptop, super fast!",
 *   "rating": 5,
 *   "uploaded_images": ["image1.jpg", "image2.png"],
 *   "product_id": "1234abcd"
 * }
 */
export const addProductRating = async (payload) => {
  const response = await API.post("/api/v1/products/product-rating/", payload);
  return response.data;
};