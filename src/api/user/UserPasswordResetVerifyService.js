import API from "../../axios";

export const verifyPasswordResetOTP = async (email, otp) => {
  console.log("Dummy OTP verification:", { email, otp });

  return {
    success: true,
    message: "OTP verified successfully (dummy)."
  };
};


/**
 * Verify OTP for password reset
 * POST /api/v1/user/password-reset-verify/
 */
// export const verifyPasswordResetOTP = async (email, otp) => {
//   try {
//     const response = await API.post("/v1/user/password-reset-verify/", {
//       email,
//       otp
//     });

//     return response.data; // usually {}
//   } catch (error) {
//     console.error("Error verifying password reset OTP:", error);
//     throw error;
//   }
// };
