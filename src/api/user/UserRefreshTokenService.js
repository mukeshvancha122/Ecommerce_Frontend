import API from "../../axios";

export const refreshToken = async (refreshTokenValue) => {
  console.log("Dummy refresh token call with:", refreshTokenValue);

  return {
    access: "new_dummy_access_token_123",
    refresh: refreshTokenValue || "new_dummy_refresh_token_456",
  };
};

// export const refreshToken = async (refreshTokenValue) => {
//   try {
//     const response = await API.post("/v1/user/refresh-token/", {
//       refresh: refreshTokenValue,
//     });

//     // expected: { access, refresh }
//     return response.data;
//   } catch (error) {
//     console.error("Error refreshing token:", error);
//     throw error;
//   }
// };

