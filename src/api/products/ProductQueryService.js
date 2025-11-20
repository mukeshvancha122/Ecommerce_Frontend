import API from "../../axios";

export const addProductQuery = async (payload) => {
  console.log("Dummy POST payload:", payload);

  return {
    success: true,
    message: "Query added successfully (dummy)",
    data: {
      id: 1,
      content: payload.content,
      product_id: payload.product_id,
      created_at: new Date().toISOString()
    }
  };
};

// export const addProductQuery = async (payload) => {
//   try {
//     const response = await API.post("/v1/products/add-query/", payload);
//     return response.data;
//   } catch (error) {
//     console.error("Error adding product query:", error);
//     throw error;
//   }
// };
