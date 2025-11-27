/**
 * Converts relative image URLs from the database to absolute URLs
 * @param {string|object} imageUrl - The image URL from the database (can be string or object)
 * @returns {string} - The absolute image URL
 */
const getApiBaseUrl = () => {
  if (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE_URL) {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    // Remove /api suffix if present (we'll add it back for images)
    return baseUrl.replace(/\/api\/?$/, "");
  }
  if (typeof window !== "undefined" && window.__HYDERNEXA_API_BASE__) {
    return window.__HYDERNEXA_API_BASE__;
  }
  // default fallback to production host (without /api)
  return "http://54.145.239.205:8000";
};

export const getImageUrl = (imageUrl) => {
  // Handle null, undefined, or empty string
  if (!imageUrl) {
    return "/images/NO_IMG.png";
  }

  // Handle object format (e.g., { product_image: "path/to/image.jpg" })
  if (typeof imageUrl === "object") {
    if (imageUrl.product_image) {
      imageUrl = imageUrl.product_image;
    } else if (imageUrl.url) {
      imageUrl = imageUrl.url;
    } else if (imageUrl.image) {
      imageUrl = imageUrl.image;
    } else {
      return "/images/NO_IMG.png";
    }
  }

  // Convert to string if not already
  const imageStr = String(imageUrl).trim();

  if (!imageStr || imageStr === "null" || imageStr === "undefined") {
    return "/images/NO_IMG.png";
  }

  const lowered = imageStr.toLowerCase();
  
  // Check for placeholder URLs
  if (
    lowered.includes("placeholder.com") ||
    lowered.includes("placehold.it") ||
    lowered.includes("placehold.co") ||
    lowered.includes("via.placeholder")
  ) {
    return "/images/NO_IMG.png";
  }

  // Already absolute URL - return as-is (will be handled by onError if 404)
  if (imageStr.startsWith("http://") || imageStr.startsWith("https://")) {
    // Return the URL as-is - the browser will handle 404s and trigger onError
    return imageStr;
  }

  const baseURL = getApiBaseUrl();

  // Handle different path formats from backend
  // Format 1: Starts with /media/ or /static/
  if (imageStr.startsWith("/media/") || imageStr.startsWith("/static/")) {
    return `${baseURL}${imageStr}`;
  }

  // Format 2: Starts with / (absolute path on server)
  if (imageStr.startsWith("/")) {
    return `${baseURL}${imageStr}`;
  }

  // Format 3: Starts with media/ (relative, no leading slash)
  if (imageStr.startsWith("media/")) {
    return `${baseURL}/${imageStr}`;
  }

  // Format 4: Just a filename or relative path
  // Try /media/ prefix first (common Django pattern)
  if (!imageStr.includes("/")) {
    return `${baseURL}/media/${imageStr}`;
  }

  // Format 5: Relative path with subdirectories
  return `${baseURL}/${imageStr}`;
};

