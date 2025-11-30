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

    // Check if response indicates an error (4xx status)
    if (response.status >= 400) {
      const errorData = response.data || {};
      const errorMessage = 
        errorData.detail || 
        errorData.message || 
        errorData.error ||
        (typeof errorData === 'string' ? errorData : 'Login failed');
      
      console.error("Login API error response:", {
        status: response.status,
        data: errorData,
        message: errorMessage
      });
      
      const error = new Error(errorMessage);
      error.response = response;
      throw error;
    }

    console.log("Login API response:", response.data);
    console.log("Response status:", response.status);
    console.log("Response structure:", {
      hasData: !!response.data,
      hasAccess: !!response.data?.access,
      hasRefresh: !!response.data?.refresh,
      hasUserDetails: !!response.data?.data?.user_details,
      topLevelKeys: Object.keys(response.data || {}),
      dataKeys: Object.keys(response.data?.data || {})
    });

    // Handle different response formats
    // Format 1: { data: { user_details: {...} }, access, refresh }
    // Format 2: { access, refresh, user }
    // Format 3: { token, email }
    // Format 4: { access_token, refresh_token, user }
    const data = response.data;
    
    // Validate response structure
    if (!data) {
      throw new Error("Invalid response from server: No data received");
    }
    
    // Extract user details from different possible locations
    let user = null;
    let userEmail = email;
    
    if (data.data?.user_details) {
      // New format: { data: { user_details: { email, name, ... } } }
      const userDetails = data.data.user_details;
      user = {
        email: userDetails.email || email,
        name: userDetails.name || null,
        id: userDetails.id || null,
        user_image: userDetails.user_image || null,
        user_type: userDetails.user_type || null,
        email_verified: userDetails.email_verified || false,
      };
      userEmail = userDetails.email || email;
    } else if (data.user) {
      // Format: { user: { email, name, ... } }
      user = data.user;
      userEmail = data.user.email || email;
    } else if (data.email) {
      // Format: { email, ... }
      user = { email: data.email || email };
      userEmail = data.email || email;
    } else {
      // Fallback: create user object from email
      user = { email: email };
      userEmail = email;
    }
    
    // Extract tokens - check multiple possible locations
    // The API might return: 
    // - { data: { access: "...", refresh: "...", user_details: {...} } }
    // - { access: "...", refresh: "...", user: {...} }
    // - { access_token: "...", refresh_token: "...", user: {...} }
    // - { token: "...", email: "..." }
    const accessToken = 
      data.data?.access ||        // Format: { data: { access, refresh, user_details } }
      data.data?.access_token ||  // Format: { data: { access_token, refresh_token } }
      data.access ||              // Format: { access, refresh, user }
      data.access_token ||        // Format: { access_token, refresh_token, user }
      data.token ||               // Format: { token, email }
      null;
    
    const refreshToken = 
      data.data?.refresh ||        // Format: { data: { access, refresh, user_details } }
      data.data?.refresh_token ||  // Format: { data: { access_token, refresh_token } }
      data.refresh ||              // Format: { access, refresh, user }
      data.refresh_token ||        // Format: { access_token, refresh_token, user }
      null;
    
    console.log("Token extraction:", {
      "data.data.access": data.data?.access ? "FOUND" : "NOT FOUND",
      "data.access": data.access ? "FOUND" : "NOT FOUND",
      "finalAccessToken": accessToken ? "FOUND" : "NOT FOUND",
      "finalRefreshToken": refreshToken ? "FOUND" : "NOT FOUND"
    });
    
    console.log("Processed login data:", {
      hasAccessToken: !!accessToken,
      accessTokenValue: accessToken ? accessToken.substring(0, 20) + "..." : "MISSING",
      hasRefreshToken: !!refreshToken,
      user: user,
      rawResponse: data
    });
    
    // Validate that we have a token
    if (!accessToken) {
      console.error("No access token found in response:", {
        responseData: data,
        availableKeys: Object.keys(data || {}),
        dataKeys: Object.keys(data?.data || {})
      });
      throw new Error("No authentication token received from server.");
    }
    
    return {
      access: accessToken,
      refresh: refreshToken,
      user: user,
      email: userEmail,
      token: accessToken, // For backward compatibility
    };
  } catch (error) {
    console.error("Error fetching user token:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    
    // Handle authentication errors
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Handle different error formats
      let errorMessage = 'Login failed';
      
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (Array.isArray(errorData) && errorData.length > 0) {
        // Handle array of errors
        errorMessage = errorData[0];
      } else if (typeof errorData === 'object') {
        // Try to extract error message from object
        const errorKeys = Object.keys(errorData);
        if (errorKeys.length > 0) {
          const firstKey = errorKeys[0];
          const firstValue = errorData[firstKey];
          if (Array.isArray(firstValue) && firstValue.length > 0) {
            errorMessage = `${firstKey}: ${firstValue[0]}`;
          } else if (typeof firstValue === 'string') {
            errorMessage = `${firstKey}: ${firstValue}`;
          } else {
            errorMessage = JSON.stringify(errorData);
          }
        }
      }
      
      const enhancedError = new Error(errorMessage);
      enhancedError.response = error.response;
      throw enhancedError;
    }
    
    // If no response data, use the error message
    if (error.message) {
      throw error;
    }
    
    throw new Error('Login failed: Unable to connect to server');
  }
};
