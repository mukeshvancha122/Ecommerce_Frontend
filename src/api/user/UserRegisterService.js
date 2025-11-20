import API from "../../axios";

/**
 * Register User
 * POST /api/v1/user/register/
 */

export const registerUser = async ({ email, password, re_password, dob }) => {
  console.log("Dummy register:", { email, password, re_password, dob });

  return {
    id: 1,
    email,
    dob,
    message: "User registered successfully (dummy)."
  };
};

// export const registerUser = async ({ email, password, re_password, dob }) => {
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
