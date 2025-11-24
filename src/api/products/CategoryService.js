import API from "../../axios";
import { getTranslatedContent } from "../../utils/language";

/**
 * Get all categories
 * GET /api/v1/products/category-view/
 */
export const getAllCategories = async () => {
  const response = await API.get("/api/v1/products/category-view/");
  const categories = response.data;
  
  // Apply translations if needed
  if (Array.isArray(categories)) {
    return categories.map((cat) => ({
      ...cat,
      category_name: cat.category_name && typeof cat.category_name === 'object' 
        ? getTranslatedContent(cat.category_name) 
        : cat.category_name,
      description: cat.description && typeof cat.description === 'object'
        ? getTranslatedContent(cat.description)
        : cat.description,
    }));
  }
  return categories;
};

