import API from "../../axios";

/**
 * Register User
 * POST /api/v1/user/register/
 * 
 * @param {Object} payload - Registration data
 * @param {string} payload.email - User email
 * @param {string} payload.password - User password
 * @param {string} payload.re_password - Password confirmation
 * @param {string} payload.dob - Date of birth (YYYY-MM-DD format)
 * @returns {Promise<Object>} Response with { id, email, dob }
 */
export const registerUser = async ({ email, password, re_password, dob }) => {
  try {
    // Build payload - only include dob if provided
    const payload = {
      email: email.trim(),
      password,
      re_password,
    };
    
    if (dob) {
      payload.dob = dob;
    }

    console.log("Registering user with payload:", { ...payload, password: "***", re_password: "***" });

    const response = await API.post("/v1/user/register/", payload);

    console.log("Registration response:", response.data);

    // API returns { detail: "User Created!" } or { id, email, dob }
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    console.error("Error response:", error.response?.data);
    
    // Handle validation errors
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Handle different error formats
      let errorMessage = "";
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.email && Array.isArray(errorData.email)) {
        errorMessage = errorData.email[0];
      } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
        errorMessage = errorData.non_field_errors[0];
      } else {
        errorMessage = 'Registration failed';
      }
      
      const enhancedError = new Error(errorMessage);
      enhancedError.response = error.response;
      throw enhancedError;
    }
    
    throw error;
  }
};
//   try {
//     const response = await API.post("/v1/user/register/", {
//       email,
//       password,
//       re_password,
//       dob
//     });

//     return response.data; // expected: {id, email, dob}
//   } catch (error) {
//     console.error("Error registering user:", error);
//     throw error;
//   }
// };
