import API from "../../axios";

/**
 * Update password for logged-in user
 * PUT /api/v1/user/update-password/
 */
export const updatePassword = async ({
  old_password,
  password,
  re_password,
}) => {
  try {
    const response = await API.put("/api/v1/user/update-password/", {
      old_password,
      password,
      re_password,
    });

    return response.data; // usually {}
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};
