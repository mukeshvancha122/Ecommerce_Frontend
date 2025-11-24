import API from "../../axios";

/**
 * Login / get token
 * POST /api/v1/user/get-token/
 */
export const getUserToken = async (email, password) => {
  try {
    const response = await API.post("/api/v1/user/get-token/", {
      email,
      password,
    });

    return response.data;  // expected: { email, password OR token }
  } catch (error) {
    console.error("Error fetching user token:", error);
    throw error;
  }
};
