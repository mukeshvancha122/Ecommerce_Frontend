import API from "../../axios";

/**
 * Login / get token
 * POST /api/v1/user/get-token/
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Response with { access, refresh, user } or { token, email }
 */
export const getUserToken = async (email, password) => {
  try {
    const response = await API.post("/v1/user/get-token/", {
      email,
      password,
    });

    // Handle different response formats
    // Format 1: { access, refresh, user }
    // Format 2: { token, email }
    // Format 3: { access_token, refresh_token, user }
    const data = response.data;
    
    return {
      access: data.access || data.access_token || data.token,
      refresh: data.refresh || data.refresh_token || null,
      user: data.user || { email: data.email || email },
      email: data.email || email,
      token: data.access || data.access_token || data.token, // For backward compatibility
    };
  } catch (error) {
    console.error("Error fetching user token:", error);
    
    // Handle authentication errors
    if (error.response?.data) {
      const errorData = error.response.data;
      const errorMessage = 
        errorData.detail || 
        errorData.message || 
        (typeof errorData === 'string' ? errorData : 'Login failed');
      
      const enhancedError = new Error(errorMessage);
      enhancedError.response = error.response;
      throw enhancedError;
    }
    
    throw error;
  }
};
