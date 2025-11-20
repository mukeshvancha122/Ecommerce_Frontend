import { searchProducts } from "./searchProduct/SearchProductService";
import { getCurrentLanguage } from "../../utils/language";

let cachedProducts = null;
let cachedLanguage = null;

const hydrateProducts = async () => {
  const currentLang = getCurrentLanguage();
  // Clear cache if language changed
  if (cachedLanguage !== currentLang) {
    cachedProducts = null;
    cachedLanguage = currentLang;
  }
  if (cachedProducts) return cachedProducts;
  const response = await searchProducts({});
  cachedProducts = response?.results || [];
  return cachedProducts;
};

const normalizeId = (value) => String(value ?? "").toLowerCase();

const findProduct = async (predicate) => {
  const products = await hydrateProducts();
  return products.find(predicate) || products[0] || null;
};

export const getProductBySlug = async (slugOrId) =>
  findProduct(
    (product) =>
      normalizeId(product.slug) === normalizeId(slugOrId) ||
      normalizeId(product.id) === normalizeId(slugOrId)
  );

export const getProductById = async (id) =>
  findProduct((product) => normalizeId(product.id) === normalizeId(id));

export const getAllProducts = async () => hydrateProducts();

export const getRelatedProducts = async ({
  categorySlug,
  excludeSlug,
  minRating = 0,
  limit = 20,
} = {}) => {
  const products = await hydrateProducts();
  return products
    .filter((product) => {
      if (excludeSlug && product.slug === excludeSlug) return false;
      const productCategory =
        product.product_category?.slug ||
        product.product_category?.category_name?.toLowerCase();
      const rating = parseFloat(product.get_rating_info || "0");
      const matchesCategory = categorySlug
        ? productCategory === categorySlug ||
          product.product_category?.category_name
            ?.toLowerCase()
            ?.includes(categorySlug.toLowerCase())
        : true;
      return matchesCategory && (!minRating || rating >= minRating);
    })
    .slice(0, limit);
};

export const getFrequentlyViewedProducts = async (limit = 12) => {
  const products = await hydrateProducts();
  return products
    .slice()
    .sort((a, b) => {
      const ratingA = parseFloat(a.get_rating_info || "0");
      const ratingB = parseFloat(b.get_rating_info || "0");
      return ratingB - ratingA;
    })
    .slice(0, limit);
};
