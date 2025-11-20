import API from "../../axios";
import { getCurrentLanguage, getTranslatedContent } from "../../utils/language";

const SUBCATEGORIES_DATA = [
  {
    id: 1,
    sub_category: {
      en: "Casual Shirts",
      hi: "कैजुअल शर्ट",
      de: "Freizeithemden",
      es: "Camisas Casuales",
    },
    category_name: {
      en: "Men's Fashion",
      hi: "पुरुषों का फैशन",
      de: "Herrenmode",
      es: "Moda Masculina",
    },
    category_discount: 20,
    discount_start_date: "2025-11-20T01:25:25.233Z",
    discount_end_date: "2025-12-05T01:25:25.233Z",
    slug: "mens-casual-shirts",
    is_discount_active: true,
  },
  {
    id: 2,
    sub_category: {
      en: "Formal Shoes",
      hi: "फॉर्मल जूते",
      de: "Formelle Schuhe",
      es: "Zapatos Formales",
    },
    category_name: {
      en: "Men's Fashion",
      hi: "पुरुषों का फैशन",
      de: "Herrenmode",
      es: "Moda Masculina",
    },
    category_discount: 15,
    discount_start_date: "2025-11-25T01:25:25.233Z",
    discount_end_date: "2025-11-30T01:25:25.233Z",
    slug: "mens-formal-shoes",
    is_discount_active: false,
  },
  {
    id: 3,
    sub_category: {
      en: "Smartphones",
      hi: "स्मार्टफोन",
      de: "Smartphones",
      es: "Teléfonos Inteligentes",
    },
    category_name: {
      en: "Electronics",
      hi: "इलेक्ट्रॉनिक्स",
      de: "Elektronik",
      es: "Electrónica",
    },
    category_discount: 10,
    discount_start_date: "2025-11-22T01:25:25.233Z",
    discount_end_date: "2025-12-10T01:25:25.233Z",
    slug: "electronics-smartphones",
    is_discount_active: true,
  },
  {
    id: 4,
    sub_category: {
      en: "Laptops",
      hi: "लैपटॉप",
      de: "Laptops",
      es: "Laptops",
    },
    category_name: {
      en: "Electronics",
      hi: "इलेक्ट्रॉनिक्स",
      de: "Elektronik",
      es: "Electrónica",
    },
    category_discount: 5,
    discount_start_date: null,
    discount_end_date: null,
    slug: "electronics-laptops",
    is_discount_active: false,
  },
];

export const getCategorySubcategories = async () => {
  return SUBCATEGORIES_DATA.map((sub) => ({
    ...sub,
    sub_category: getTranslatedContent(sub.sub_category),
    category_name: getTranslatedContent(sub.category_name),
  }));
};

// GET: /api/v1/products/category-subcategory-view/ --axios
// export const getCategorySubcategories = async () => {
//   try {
//     const response = await API.get("/v1/products/category-subcategory-view/");
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching category-subcategory data:", error);
//     throw error;
//   }
// };


