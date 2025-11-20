import API from "../../axios";

/**
 * Reset password (final step)
 * POST /api/v1/user/reset_password/
 */
export const resetPassword = async (password, re_password) => {
  try {
    const response = await API.post("/v1/user/reset_password/", {
      password,
      re_password
    });

    return response.data; // usually {}
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

// export const resetPassword = async (password, re_password) => {
//   console.log("Dummy reset password:", { password, re_password });

//   return {
//     success: true,
//     message: "Password has been reset successfully (dummy)."
//   };
// };