import API from "../../../axios";

// topReviewService.js (Dummy Version)

export const getTopReviews = async (product_id) => {
  console.log("Dummy top reviews for product:", product_id);

  return [
    {
      id: 1,
      username: "mohit123",
      review: "Amazing product! Great build quality.",
      rating: 5
    },
    {
      id: 2,
      username: "sara_k",
      review: "Worth the money, highly recommended.",
      rating: 4
    },
    {
      id: 3,
      username: "raj_dev",
      review: "Good features but packaging could be better.",
      rating: 3
    }
  ];
};




// export const getTopReviews = async (product_id) => {
//   try {
//     const response = await API.get("/v1/products/top-review/", {
//       params: { product_id }
//     });
//     return response.data; // array of reviews
//   } catch (error) {
//     console.error("Error fetching top reviews:", error);
//     throw error;
//   }
// };