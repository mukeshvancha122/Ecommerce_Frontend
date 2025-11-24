import API from "../../axios";

/**
 * Fetch Profile Summary
 * GET /api/v1/user/profile/ or GET /api/v1/account/profile/
 */
export const fetchProfileSummary = async () => {
  try {
    // Try v1/user/profile first, fallback to v1/account/profile
    try {
      const response = await API.get("/api/v1/user/profile/");
      if (response.data) {
        return response;
      }
    } catch (e) {
      // If first endpoint fails, try the alternative
      try {
        const response = await API.get("/api/v1/account/profile/");
        if (response.data) {
          return response;
        }
      } catch (e2) {
        // Both endpoints failed, return null to indicate no profile available
        console.warn("Profile endpoints not available:", e2.message);
        return { data: null };
      }
    }
    // If we get here, no data was returned
    return { data: null };
  } catch (error) {
    console.error("Error fetching profile:", error);
    // Return null data instead of throwing to allow graceful handling
    return { data: null };
  }
};

