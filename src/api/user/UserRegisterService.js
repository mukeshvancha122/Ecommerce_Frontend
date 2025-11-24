import API from "../../axios";

/**
 * Register User
 * POST /api/v1/user/register/
 */
export const registerUser = async ({ email, password, re_password, dob }) => {
  try {
    const response = await API.post("/api/v1/user/register/", {
      email,
      password,
      re_password,
      dob
    });

    return response.data; // expected: {id, email, dob}
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};
