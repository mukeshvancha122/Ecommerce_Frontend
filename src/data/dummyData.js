/**
 * Dummy Data for Local Development
 * 
 * This file contains mock data that mimics the structure of the AWS backend API responses.
 * Used when REACT_APP_USE_DUMMY_DATA=true or when running on localhost in development.
 */

// Helper to simulate API delay
export const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Dummy Categories
export const DUMMY_CATEGORIES = [
  {
    id: 1,
    slug: "electronics",
    category_name: { en: "Electronics", hi: "इलेक्ट्रॉनिक्स" },
    description: { en: "Latest electronics and gadgets", hi: "नवीनतम इलेक्ट्रॉनिक्स" },
    category_image: "/images/categories/electronics.jpg"
  },
  {
    id: 2,
    slug: "clothing",
    category_name: { en: "Clothing", hi: "कपड़े" },
    description: { en: "Fashion and apparel", hi: "फैशन और परिधान" },
    category_image: "/images/categories/clothing.jpg"
  },
  {
    id: 3,
    slug: "home-garden",
    category_name: { en: "Home & Garden", hi: "घर और बगीचा" },
    description: { en: "Home improvement and garden supplies", hi: "घर सुधार और बगीचा आपूर्ति" },
    category_image: "/images/categories/home.jpg"
  },
  {
    id: 4,
    slug: "books",
    category_name: { en: "Books", hi: "किताबें" },
    description: { en: "Books and media", hi: "किताबें और मीडिया" },
    category_image: "/images/categories/books.jpg"
  }
];

// Dummy Subcategories
export const DUMMY_SUBCATEGORIES = [
  {
    id: 1,
    slug: "smartphones",
    sub_category: { en: "Smartphones", hi: "स्मार्टफोन" },
    category_name: { en: "Electronics", hi: "इलेक्ट्रॉनिक्स" },
    sub_category_image: "/images/subcategories/smartphones.jpg"
  },
  {
    id: 2,
    slug: "laptops",
    sub_category: { en: "Laptops", hi: "लैपटॉप" },
    category_name: { en: "Electronics", hi: "इलेक्ट्रॉनिक्स" },
    sub_category_image: "/images/subcategories/laptops.jpg"
  },
  {
    id: 3,
    slug: "mens-wear",
    sub_category: { en: "Men's Wear", hi: "पुरुषों के कपड़े" },
    category_name: { en: "Clothing", hi: "कपड़े" },
    sub_category_image: "/images/subcategories/mens.jpg"
  },
  {
    id: 4,
    slug: "womens-wear",
    sub_category: { en: "Women's Wear", hi: "महिलाओं के कपड़े" },
    category_name: { en: "Clothing", hi: "कपड़े" },
    sub_category_image: "/images/subcategories/womens.jpg"
  }
];

// Dummy Products
const createDummyProduct = (id, name, price, discount = 0.1) => ({
  id,
  slug: `product-${id}`,
  product_name: { en: name, hi: name },
  brand: {
    id: 1,
    brand_name: "HyderNexa Brand",
    slug: "hydernexa-brand"
  },
  product_category: {
    id: 1,
    slug: "electronics",
    category_name: { en: "Electronics", hi: "इलेक्ट्रॉनिक्स" }
  },
  sub_category: {
    id: 1,
    slug: "smartphones",
    sub_category_name: { en: "Smartphones", hi: "स्मार्टफोन" }
  },
  product_variations: [
    {
      id: id * 10,
      product_price: price,
      get_discounted_price: {
        final_price: price * (1 - discount),
        discount_percentage: discount * 100
      },
      stock: {
        quantity: Math.floor(Math.random() * 100) + 10,
        text: "In stock"
      },
      product_color: "Black",
      product_size: "Standard",
      product_images: [
        {
          id: id * 100,
          product_image: `/images/products/product-${id}.jpg`
        }
      ]
    }
  ],
  get_rating_info: {
    average_rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
    total_ratings: Math.floor(Math.random() * 500) + 50
  },
  free_delivery: Math.random() > 0.5,
  exciting_deals: Math.random() > 0.7,
  has_cashback: Math.random() > 0.6
});

export const DUMMY_PRODUCTS = Array.from({ length: 20 }, (_, i) => 
  createDummyProduct(
    i + 1,
    `HyderNexa Product ${i + 1}`,
    1000 + (i * 500),
    0.1 + (Math.random() * 0.2)
  )
);

// Dummy Featured Products (first 6)
export const DUMMY_FEATURED = {
  count: 6,
  next: null,
  previous: null,
  results: DUMMY_PRODUCTS.slice(0, 6)
};

// Dummy Top Selling (next 6)
export const DUMMY_TOP_SELLING = {
  count: 6,
  next: null,
  previous: null,
  results: DUMMY_PRODUCTS.slice(6, 12)
};

// Dummy Weekly Drops (last 6)
export const DUMMY_WEEKLY_DROPS = {
  count: 6,
  next: null,
  previous: null,
  results: DUMMY_PRODUCTS.slice(12, 18)
};

// Dummy Most Sold
export const DUMMY_MOST_SOLD = {
  count: 4,
  next: null,
  previous: null,
  results: DUMMY_PRODUCTS.slice(0, 4)
};

// Dummy Sale Categories
export const DUMMY_SALE_CATEGORIES = [
  {
    id: 1,
    slug: "for-her",
    category_name: { en: "For Her", hi: "उसके लिए" },
    category_image: "/images/sale/for-her.jpg"
  },
  {
    id: 2,
    slug: "for-him",
    category_name: { en: "For Him", hi: "उसके लिए" },
    category_image: "/images/sale/for-him.jpg"
  },
  {
    id: 3,
    slug: "new-arrivals",
    category_name: { en: "New Arrivals", hi: "नए आगमन" },
    category_image: "/images/sale/arrivals.jpg"
  }
];

// Dummy User Profile
export const DUMMY_PROFILE = {
  name: "John Doe",
  email: "john.doe@example.com",
  primaryPhone: "+91 98765 43210",
  passkeyEnabled: false,
  passwordLastChanged: new Date().toISOString(),
  security: {
    lastLogin: new Date().toISOString(),
    activity: [
      {
        id: "evt1",
        label: "Password updated",
        description: "You changed your password",
        at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "evt2",
        label: "New device sign-in",
        description: "MacBook Pro · Hyderabad, India",
        at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    devices: [
      {
        id: "dev1",
        label: "MacBook Pro",
        location: "Hyderabad, India",
        lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  preferences: {
    language: "English",
    country: "India",
    currency: "INR"
  },
  addresses: [
    {
      id: 1,
      label: "Home",
      line1: "123 Main Street",
      line2: "Apt 4B",
      city: "Hyderabad",
      state: "Telangana",
      zip: "500092",
      country: "India",
      phone: "+91 98765 43210"
    }
  ],
  payments: [
    {
      id: 1,
      brand: "Visa",
      last4: "4242",
      exp: "12/25"
    }
  ],
  stats: {
    loyalty: "HyderNexa Prime",
    ordersYtd: 12,
    returns: 1,
    credits: "₹2,500",
    perksProgress: 45
  }
};

// Dummy Search Results
export const getDummySearchResults = (query = "", filters = {}) => {
  let results = [...DUMMY_PRODUCTS];
  
  // Filter by query
  if (query) {
    results = results.filter(p => 
      p.product_name.en.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  // Filter by category
  if (filters.category && filters.category !== "all") {
    results = results.filter(p => 
      p.product_category.slug === filters.category
    );
  }
  
  // Filter by price
  if (filters.min_price) {
    results = results.filter(p => {
      const price = p.product_variations[0].get_discounted_price.final_price;
      return price >= filters.min_price;
    });
  }
  
  if (filters.max_price) {
    results = results.filter(p => {
      const price = p.product_variations[0].get_discounted_price.final_price;
      return price <= filters.max_price;
    });
  }
  
  return {
    count: results.length,
    next: null,
    previous: null,
    results: results.slice(0, filters.page_size || 20),
    brands: ["HyderNexa Brand", "Premium Brand"],
    attributes: {}
  };
};

// Dummy Wishlist
export const DUMMY_WISHLIST = {
  count: 3,
  next: null,
  previous: null,
  results: DUMMY_PRODUCTS.slice(0, 3)
};

// Dummy Orders
export const DUMMY_ORDERS = [
  {
    id: 1,
    order_number: "HN-2024-001",
    status: "delivered",
    total: 2499,
    currency: "INR",
    items: DUMMY_PRODUCTS.slice(0, 2),
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    delivered_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    order_number: "HN-2024-002",
    status: "shipped",
    total: 1599,
    currency: "INR",
    items: DUMMY_PRODUCTS.slice(2, 3),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Dummy Addresses
export const DUMMY_ADDRESSES = [
  {
    id: 1,
    label: "Home",
    line1: "123 Main Street",
    line2: "Apt 4B",
    city: "Hyderabad",
    state: "Telangana",
    zip: "500092",
    country: "India",
    phone: "+91 98765 43210",
    is_default: true
  },
  {
    id: 2,
    label: "Work",
    line1: "456 Business Park",
    line2: "Floor 5",
    city: "Hyderabad",
    state: "Telangana",
    zip: "500081",
    country: "India",
    phone: "+91 98765 43211",
    is_default: false
  }
];

// Dummy Payment Methods
export const DUMMY_PAYMENT_METHODS = [
  {
    id: 1,
    brand: "Visa",
    last4: "4242",
    exp_month: 12,
    exp_year: 2025,
    is_default: true
  },
  {
    id: 2,
    brand: "Mastercard",
    last4: "5555",
    exp_month: 6,
    exp_year: 2026,
    is_default: false
  }
];

