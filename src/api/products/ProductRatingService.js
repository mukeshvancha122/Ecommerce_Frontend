import API from "../../axios";

// example payload:
// { 
//   "review": "Amazing laptop, super fast!",
//   "rating": 5,
//   "uploaded_images": ["image1.jpg", "image2.png"],
//   "product_id": "1234abcd"
// }


export const addProductRating = async (payload) => {
  console.log("Dummy POST payload:", payload);

  return {
    id: 1,
    username: "john_doe",
    review: payload.review,
    rating: payload.rating
  };
};

// export const addProductRating = async (payload) => {
//   try {
//     const response = await API.post("/v1/products/product-rating/", payload);
//     return response.data;
//   } catch (error) {
//     console.error("Error posting product rating:", error);
//     throw error;
//   }
// };