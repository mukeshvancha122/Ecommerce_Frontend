import API from "../../axios";

export const updatePassword = async ({
  old_password,
  password,
  re_password,
}) => {
  console.log("Dummy update password:", {
    old_password,
    password,
    re_password,
  });

  return {
    success: true,
    message: "Password updated successfully (dummy).",
  };
};


/**
 * Update password for logged-in user
 * PUT /api/v1/user/update-password/
 */
// export const updatePassword = async ({
//   old_password,
//   password,
//   re_password,
// }) => {
//   try {
//     const response = await API.put("/v1/user/update-password/", {
//       old_password,
//       password,
//       re_password,
//     });

//     return response.data; // usually {}
//   } catch (error) {
//     console.error("Error updating password:", error);
//     throw error;
//   }
// };
