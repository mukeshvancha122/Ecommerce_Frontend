import API from "../../axios";
import { getTranslatedContent } from "../../utils/language";

/**
 * Helper to safely extract string from translation object
 */
const extractString = (value) => {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const translated = getTranslatedContent(value);
    // If getTranslatedContent returns an object, try to extract a string
    if (typeof translated === 'string') return translated;
    if (typeof translated === 'object' && translated !== null) {
      // Try common translation keys
      if (translated.en && typeof translated.en === 'string') return translated.en;
      // Try to find any string value
      for (const key in translated) {
        if (typeof translated[key] === 'string') return translated[key];
      }
    }
  }
  return value;
};

/**
 * Get Category Subcategories
 * GET /api/v1/products/category-subcategory-view/
 */
export const getCategorySubcategories = async () => {
  const response = await API.get("/api/v1/products/category-subcategory-view/");
  const data = response.data;
  
  // Apply translations if needed, but ensure we don't return objects
  if (Array.isArray(data)) {
    return data.map((sub) => ({
      ...sub,
      // Keep original structure but don't force string conversion here
      // Let components handle it with their helper functions
      sub_category: sub.sub_category,
      category_name: sub.category_name,
    }));
  }
  return data;
};


