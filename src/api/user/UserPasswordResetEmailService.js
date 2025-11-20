// passwordService.js
import axios from "../../axios";

// passwordService.js (Dummy Version)

export const sendPasswordResetEmail = async (email, otp) => {
  console.log("Dummy password reset email:", { email, otp });

  return {
    success: true,
    message: "Password reset email sent successfully (dummy)."
  };
};


/**
 * Sends password reset OTP email.
 * POST /api/v1/user/password-reset-email/
 */
// export const sendPasswordResetEmail = async (email, otp) => {
//   try {
//     const response = await API.post("/v1/user/password-reset-email/", {
//       email,
//       otp
//     });

//     return response.data; // usually {}
//   } catch (error) {
//     console.error("Error sending password reset email:", error);
//     throw error;
//   }
// };
