import API from "../../axios";

/**
 * Verify OTP for password reset
 * POST /api/v1/user/password-reset-verify/
 */
export const verifyPasswordResetOTP = async (email, otp) => {
  try {
    const response = await API.post("/api/v1/user/password-reset-verify/", {
      email,
      otp
    });

    return response.data; // usually {}
  } catch (error) {
    console.error("Error verifying password reset OTP:", error);
    throw error;
  }
};
