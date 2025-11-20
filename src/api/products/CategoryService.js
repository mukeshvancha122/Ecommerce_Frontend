import API from "../../axios";
import { getCurrentLanguage, getTranslatedContent } from "../../utils/language";

const CATEGORIES_DATA = [
  {
    id: 1,
    category_name: {
      en: "Men's Fashion",
      hi: "पुरुषों का फैशन",
      de: "Herrenmode",
      es: "Moda Masculina",
    },
    category_image: "https://via.placeholder.com/300x200?text=Men+Fashion",
    slug: "mens-fashion",
    is_discount_active: true,
    discount_start_date: "2025-11-20T01:18:33.423Z",
    discount_end_date: "2025-12-20T01:18:33.423Z",
    description: {
      en: "Latest trends in men's clothing, shoes and accessories.",
      hi: "पुरुषों के कपड़े, जूते और सामान में नवीनतम रुझान।",
      de: "Neueste Trends in Herrenbekleidung, Schuhen und Accessoires.",
      es: "Últimas tendencias en ropa, zapatos y accesorios para hombres.",
    },
  },
  {
    id: 2,
    category_name: {
      en: "Women's Fashion",
      hi: "महिलाओं का फैशन",
      de: "Damenmode",
      es: "Moda Femenina",
    },
    category_image: "https://via.placeholder.com/300x200?text=Women+Fashion",
    slug: "womens-fashion",
    is_discount_active: false,
    discount_start_date: null,
    discount_end_date: null,
    description: {
      en: "Explore stylish outfits, dresses, shoes, and accessories.",
      hi: "स्टाइलिश आउटफिट, ड्रेस, जूते और सामान देखें।",
      de: "Entdecken Sie stilvolle Outfits, Kleider, Schuhe und Accessoires.",
      es: "Explora outfits elegantes, vestidos, zapatos y accesorios.",
    },
  },
  {
    id: 3,
    category_name: {
      en: "Electronics",
      hi: "इलेक्ट्रॉनिक्स",
      de: "Elektronik",
      es: "Electrónica",
    },
    category_image: "https://via.placeholder.com/300x200?text=Electronics",
    slug: "electronics",
    is_discount_active: true,
    discount_start_date: "2025-11-25T01:18:33.423Z",
    discount_end_date: "2025-11-30T01:18:33.423Z",
    description: {
      en: "Mobiles, laptops, headphones, and latest gadgets.",
      hi: "मोबाइल, लैपटॉप, हेडफोन और नवीनतम गैजेट्स।",
      de: "Handys, Laptops, Kopfhörer und neueste Gadgets.",
      es: "Móviles, laptops, auriculares y últimos gadgets.",
    },
  },
  {
    id: 4,
    category_name: {
      en: "Home & Kitchen",
      hi: "घर और रसोई",
      de: "Haus & Küche",
      es: "Hogar y Cocina",
    },
    category_image: "https://via.placeholder.com/300x200?text=Home+%26+Kitchen",
    slug: "home-kitchen",
    is_discount_active: false,
    discount_start_date: null,
    discount_end_date: null,
    description: {
      en: "Home appliances, decor items, and kitchen essentials.",
      hi: "घरेलू उपकरण, सजावट की वस्तुएं और रसोई की आवश्यक वस्तुएं।",
      de: "Haushaltsgeräte, Dekoartikel und Küchenessentials.",
      es: "Electrodomésticos, artículos de decoración y esenciales de cocina.",
    },
  },
  {
    id: 5,
    category_name: {
      en: "Sports & Fitness",
      hi: "खेल और फिटनेस",
      de: "Sport & Fitness",
      es: "Deportes y Fitness",
    },
    category_image: "https://via.placeholder.com/300x200?text=Sports+%26+Fitness",
    slug: "sports-fitness",
    is_discount_active: true,
    discount_start_date: "2025-11-10T01:18:33.423Z",
    discount_end_date: "2025-11-27T01:18:33.423Z",
    description: {
      en: "Sportswear, gym equipment, and outdoor activity gear.",
      hi: "स्पोर्ट्सवियर, जिम उपकरण और आउटडोर गतिविधि गियर।",
      de: "Sportbekleidung, Fitnessgeräte und Outdoor-Ausrüstung.",
      es: "Ropa deportiva, equipamiento de gimnasio y equipo para actividades al aire libre.",
    },
  },
];

export const getAllCategories = async () => {
  const lang = getCurrentLanguage();
  return CATEGORIES_DATA.map((cat) => ({
    ...cat,
    category_name: getTranslatedContent(cat.category_name),
    description: getTranslatedContent(cat.description),
  }));
};



// GET: /api/v1/products/category-view/ - axios version
// export const getAllCategories = async () => {
//   try {
//     const response = await API.get("/v1/products/category-view/");
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     throw error;
//   }
// };

