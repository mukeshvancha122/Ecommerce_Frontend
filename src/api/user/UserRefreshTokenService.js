import API from "../../axios";

/**
 * Refresh access token
 * POST /api/v1/user/refresh-token/
 */
export const refreshToken = async (refreshTokenValue) => {
  try {
    const response = await API.post("/api/v1/user/refresh-token/", {
      refresh: refreshTokenValue,
    });

    // expected: { access, refresh }
    return response.data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

