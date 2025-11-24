
const getBackendBaseURL = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  if (process.env.NODE_ENV === 'development') {
    return '';
  }
  return "http://54.145.239.205:8000";
};

/**
 * Format image URL from backend
 * Handles both absolute URLs and relative paths
 * @param {string} imageUrl - Image URL from backend (can be relative or absolute)
 * @param {string} fallback - Fallback image path if imageUrl is invalid
 * @returns {string} Formatted image URL
 */
export const formatImageUrl = (imageUrl, fallback = "/images/NO_IMG.png") => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return fallback;
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/')) {
    const baseURL = getBackendBaseURL();
    const cleanBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    return `${cleanBase}${imageUrl}`;
  }

  const baseURL = getBackendBaseURL();
  const cleanBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  return `${cleanBase}/${imageUrl}`;
};

/**
 * Get product image URL
 * @param {Object} product - Product object
 * @param {string} fallback - Fallback image path
 * @returns {string} Product image URL
 */
export const getProductImageUrl = (product, fallback = "/images/NO_IMG.png") => {
  const imageUrl = product?.product_variations?.[0]?.product_images?.[0]?.product_image;
  return formatImageUrl(imageUrl, fallback);
};

/**
 * Get category image URL
 * @param {Object} category - Category object
 * @param {string} fallback - Fallback image path
 * @returns {string} Category image URL
 */
export const getCategoryImageUrl = (category, fallback = "/images/NO_IMG.png") => {
  const imageUrl = category?.category_image;
  return formatImageUrl(imageUrl, fallback);
};

/**
 * Get subcategory image URL
 * @param {Object} subcategory - Subcategory object
 * @param {string} fallback - Fallback image path
 * @returns {string} Subcategory image URL
 */
export const getSubCategoryImageUrl = (subcategory, fallback = "/images/NO_IMG.png") => {
  const imageUrl = subcategory?.sub_category_image;
  return formatImageUrl(imageUrl, fallback);
};

