import API from "../../axios";

/**
 * Sends password reset OTP email.
 * POST /api/v1/user/password-reset-email/
 */
export const sendPasswordResetEmail = async (email, otp) => {
  try {
    const response = await API.post("/api/v1/user/password-reset-email/", {
      email,
      otp
    });

    return response.data; // usually {}
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};
