import { translateProduct } from "./productTranslations";

export const normalizeProductResponse = (response) => {
  if (!response) return response;
  
  if (response.results && response.results.data && Array.isArray(response.results.data)) {
    return {
      ...response,
      results: response.results.data.map(product => normalizeProduct(translateProduct(product))),
      brands: response.results.brands || [],
      attributes: response.results.attributes || {}
    };
  }
  
  if (response.results && Array.isArray(response.results)) {
    return {
      ...response,
      results: response.results.map(product => normalizeProduct(translateProduct(product)))
    };
  }
  
  if (Array.isArray(response)) {
    return response.map(product => normalizeProduct(translateProduct(product)));
  }
  
  return response;
};

export const getRatingValue = (product) => {
  const ratingInfo = product?.get_rating_info;
  if (typeof ratingInfo === 'string') {
    return parseFloat(ratingInfo) || 0;
  }
  if (typeof ratingInfo === 'object' && ratingInfo !== null) {
    return parseFloat(ratingInfo.average_rating) || 0;
  }
  return 0;
};

export const getRatingText = (product) => {
  const ratingInfo = product?.get_rating_info;
  if (typeof ratingInfo === 'string') {
    return ratingInfo;
  }
  if (typeof ratingInfo === 'object' && ratingInfo !== null) {
    const avg = parseFloat(ratingInfo.average_rating) || 0;
    const total = parseInt(ratingInfo.total_ratings) || 0;
    if (total > 0) {
      return `${avg.toFixed(1)} (${total})`;
    }
    return avg > 0 ? avg.toFixed(1) : "0";
  }
  return "0";
};


export const getDiscountedPrice = (variation) => {
  const discounted = variation?.get_discounted_price;
  if (typeof discounted === 'string' || typeof discounted === 'number') {
    return String(discounted);
  }
  if (typeof discounted === 'object' && discounted !== null) {
    return String(discounted.final_price || variation?.product_price || 0);
  }
  return String(variation?.product_price || 0);
};

/**
 * Get stock value from variation
 * Handles both string and object formats
 */
export const getStockValue = (variation) => {
  const stock = variation?.stock;
  if (typeof stock === 'string' || typeof stock === 'number') {
    return String(stock);
  }
  if (typeof stock === 'object' && stock !== null) {
    return String(stock.quantity || stock.text || 0);
  }
  return "0";
};


export const getStockText = (variation) => {
  const stock = variation?.stock;
  if (typeof stock === 'string') {
    return stock;
  }
  if (typeof stock === 'object' && stock !== null) {
    return stock.text || String(stock.quantity || 0);
  }
  return String(stock || 0);
};


export const normalizeProduct = (product) => {
  if (!product) return product;
  
  if (product.get_rating_info && typeof product.get_rating_info === 'object') {
    product.get_rating_info = getRatingText(product);
  }
  
  if (Array.isArray(product.product_variations)) {
    product.product_variations = product.product_variations.map(variation => {
      if (variation.get_discounted_price && typeof variation.get_discounted_price === 'object') {
        variation.get_discounted_price = getDiscountedPrice(variation);
      }
      
      if (variation.stock && typeof variation.stock === 'object') {
        variation.stock = getStockValue(variation);
      }
      
      return variation;
    });
  }
  
  return product;
};

