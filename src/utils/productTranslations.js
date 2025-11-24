import { getCurrentLanguage, getTranslatedContent } from "./language";

/**
 * Product translations database
 * Maps product slugs to multilingual content
 */
const PRODUCT_TRANSLATIONS = {
  "nike-air-jordan": {
    product_name: {
      en: "Nike Air Jordan",
      hi: "नाइक एयर जॉर्डन",
      de: "Nike Air Jordan",
      es: "Nike Air Jordan",
    },
    product_description: {
      en: "Premium basketball shoes with high ankle support.",
      hi: "उच्च टखने के समर्थन के साथ प्रीमियम बास्केटबॉल जूते।",
      de: "Premium-Basketballschuhe mit hohem Knöchelschutz.",
      es: "Zapatillas de baloncesto premium con soporte alto para el tobillo.",
    },
    exciting_deals: {
      en: "Winter Sports Sale",
      hi: "विंटर स्पोर्ट्स सेल",
      de: "Wintersport-Verkauf",
      es: "Venta de Deportes de Invierno",
    },
    faq: {
      en: "Are these waterproof? → Yes.",
      hi: "क्या ये वाटरप्रूफ हैं? → हाँ।",
      de: "Sind diese wasserdicht? → Ja.",
      es: "¿Son impermeables? → Sí.",
    },
  },
  "5g-android-smartphone": {
    product_name: {
      en: "5G Android Smartphone",
      hi: "5G एंड्रॉइड स्मार्टफोन",
      de: "5G Android Smartphone",
      es: "Teléfono Inteligente Android 5G",
    },
    product_description: {
      en: "6.5-inch display, 8GB RAM, 128GB storage.",
      hi: "6.5 इंच डिस्प्ले, 8GB RAM, 128GB स्टोरेज।",
      de: "6,5-Zoll-Display, 8 GB RAM, 128 GB Speicher.",
      es: "Pantalla de 6.5 pulgadas, 8GB RAM, 128GB de almacenamiento.",
    },
  },
  "14-inch-thin-laptop": {
    product_name: {
      en: "14-inch Thin Laptop",
      hi: "14 इंच पतला लैपटॉप",
      de: "14-Zoll Dünnes Laptop",
      es: "Laptop Delgado de 14 Pulgadas",
    },
    product_description: {
      en: "Lightweight laptop for everyday use.",
      hi: "रोजमर्रा के उपयोग के लिए हल्का लैपटॉप।",
      de: "Leichtes Laptop für den täglichen Gebrauch.",
      es: "Laptop liviano para uso diario.",
    },
  },
  "nonstick-cookware-set": {
    product_name: {
      en: "Nonstick Cookware Set",
      hi: "नॉनस्टिक कुकवेयर सेट",
      de: "Antihaft-Kochgeschirr-Set",
      es: "Juego de Utensilios de Cocina Antiadherente",
    },
    product_description: {
      en: "Durable nonstick pots and pans set.",
      hi: "टिकाऊ नॉनस्टिक बर्तन और पैन सेट।",
      de: "Langlebiges Antihaft-Topf- und Pfannenset.",
      es: "Juego duradero de ollas y sartenes antiadherentes.",
    },
  },
  "vitamin-c-face-serum": {
    product_name: {
      en: "Vitamin C Face Serum",
      hi: "विटामिन सी फेस सीरम",
      de: "Vitamin C Gesichtsserum",
      es: "Sérum Facial de Vitamina C",
    },
    product_description: {
      en: "Brightening serum with hyaluronic acid.",
      hi: "हयालूरोनिक एसिड के साथ चमकदार सीरम।",
      de: "Aufhellendes Serum mit Hyaluronsäure.",
      es: "Sérum iluminador con ácido hialurónico.",
    },
  },
  "adjustable-dumbbell-set": {
    product_name: {
      en: "Adjustable Dumbbell Set",
      hi: "समायोज्य डंबल सेट",
      de: "Verstellbares Hantelset",
      es: "Juego de Mancuernas Ajustables",
    },
    product_description: {
      en: "Versatile dumbbells for home workouts.",
      hi: "घरेलू वर्कआउट के लिए बहुमुखी डंबल।",
      de: "Vielseitige Hanteln für Heimtrainings.",
      es: "Mancuernas versátiles para entrenamientos en casa.",
    },
  },
  "ultra-comfort-gaming-chair": {
    product_name: {
      en: "Ultra Comfort Gaming Chair",
      hi: "अल्ट्रा कम्फर्ट गेमिंग चेयर",
      de: "Ultra-Komfort-Gaming-Stuhl",
      es: "Silla de Gaming Ultra Cómoda",
    },
    product_description: {
      en: "Ergonomic gaming chair with lumbar support.",
      hi: "काठ का समर्थन के साथ एर्गोनोमिक गेमिंग चेयर।",
      de: "Ergonomischer Gaming-Stuhl mit Lendenwirbelstütze.",
      es: "Silla de gaming ergonómica con soporte lumbar.",
    },
  },
  "ultimate-gaming-laptop": {
    product_name: {
      en: "Ultimate Gaming Laptop",
      hi: "अल्टीमेट गेमिंग लैपटॉप",
      de: "Ultimatives Gaming-Laptop",
      es: "Laptop de Gaming Definitivo",
    },
    product_description: {
      en: "High-performance gaming laptop with RTX graphics.",
      hi: "RTX ग्राफिक्स के साथ उच्च-प्रदर्शन गेमिंग लैपटॉप।",
      de: "Hochleistungs-Gaming-Laptop mit RTX-Grafik.",
      es: "Laptop de gaming de alto rendimiento con gráficos RTX.",
    },
    exciting_deals: {
      en: "Holiday Mega Sale",
      hi: "हॉलिडे मेगा सेल",
      de: "Holiday Mega-Verkauf",
      es: "Mega Venta de Vacaciones",
    },
    faq: {
      en: "Does this support HDMI 2.1? → Yes.",
      hi: "क्या यह HDMI 2.1 का समर्थन करता है? → हाँ।",
      de: "Unterstützt dies HDMI 2.1? → Ja.",
      es: "¿Soporta HDMI 2.1? → Sí.",
    },
  },
};

/**
 * Category translations
 */
const CATEGORY_TRANSLATIONS = {
  Shoes: {
    en: "Shoes",
    hi: "जूते",
    de: "Schuhe",
    es: "Zapatos",
  },
  Electronics: {
    en: "Electronics",
    hi: "इलेक्ट्रॉनिक्स",
    de: "Elektronik",
    es: "Electrónica",
  },
  "Home & Kitchen": {
    en: "Home & Kitchen",
    hi: "घर और रसोई",
    de: "Haus & Küche",
    es: "Hogar y Cocina",
  },
  Beauty: {
    en: "Beauty",
    hi: "सौंदर्य",
    de: "Schönheit",
    es: "Belleza",
  },
  "Sports & Fitness": {
    en: "Sports & Fitness",
    hi: "खेल और फिटनेस",
    de: "Sport & Fitness",
    es: "Deportes y Fitness",
  },
};

/**
 * Subcategory translations
 */
const SUBCATEGORY_TRANSLATIONS = {
  "Sports Shoes": {
    en: "Sports Shoes",
    hi: "स्पोर्ट्स जूते",
    de: "Sportschuhe",
    es: "Zapatos Deportivos",
  },
  Smartphones: {
    en: "Smartphones",
    hi: "स्मार्टफोन",
    de: "Smartphones",
    es: "Teléfonos Inteligentes",
  },
  Laptops: {
    en: "Laptops",
    hi: "लैपटॉप",
    de: "Laptops",
    es: "Laptops",
  },
  Cookware: {
    en: "Cookware",
    hi: "कुकवेयर",
    de: "Kochgeschirr",
    es: "Utensilios de Cocina",
  },
  "Skin Care": {
    en: "Skin Care",
    hi: "त्वचा की देखभाल",
    de: "Hautpflege",
    es: "Cuidado de la Piel",
  },
};

/**
 * Translate a product object based on current language
 */
export const translateProduct = (product) => {
  if (!product) return product;
  getCurrentLanguage(); // Get language for potential future use
  const translations = PRODUCT_TRANSLATIONS[product.slug];

  const translated = { ...product };

  // Translate product name and description
  if (translations) {
    if (translations.product_name) {
      translated.product_name = getTranslatedContent(translations.product_name);
    }
    if (translations.product_description) {
      translated.product_description = getTranslatedContent(translations.product_description);
    }
    if (translations.exciting_deals) {
      translated.exciting_deals = getTranslatedContent(translations.exciting_deals);
    }
    if (translations.faq) {
      translated.faq = getTranslatedContent(translations.faq);
    }
  }

  // Translate category
  if (product.product_category?.category_name) {
    const catName = product.product_category.category_name;
    if (CATEGORY_TRANSLATIONS[catName]) {
      translated.product_category = {
        ...product.product_category,
        category_name: getTranslatedContent(CATEGORY_TRANSLATIONS[catName]),
      };
    }
  }

  // Translate subcategory
  if (product.sub_category?.sub_category_name) {
    const subName = product.sub_category.sub_category_name;
    if (SUBCATEGORY_TRANSLATIONS[subName]) {
      translated.sub_category = {
        ...product.sub_category,
        sub_category_name: getTranslatedContent(SUBCATEGORY_TRANSLATIONS[subName]),
      };
    }
  }

  // Translate nested product in variations
  if (translated.product_variations) {
    translated.product_variations = translated.product_variations.map((variation) => {
      if (variation.product && translations) {
        return {
          ...variation,
          product: {
            ...variation.product,
            product_name: translations.product_name
              ? getTranslatedContent(translations.product_name)
              : variation.product.product_name,
            product_description: translations.product_description
              ? getTranslatedContent(translations.product_description)
              : variation.product.product_description,
          },
        };
      }
      return variation;
    });
  }

  return translated;
};

