import API from "../../axios";

export const getUserToken = async (email, password) => {
  console.log("Dummy token request:", { email, password });

  return {
    email,
    password,
    token: "dummy_jwt_token_1234567890"
  };
};


/**
 * Login / get token
 * POST /api/v1/user/get-token/
 */
// export const getUserToken = async (email, password) => {
//   try {
//     const response = await API.post("/v1/user/get-token/", {
//       email,
//       password,
//     });

//     return response.data;  // expected: { email, password OR token }
//   } catch (error) {
//     console.error("Error fetching user token:", error);
//     throw error;
//   }
// };
