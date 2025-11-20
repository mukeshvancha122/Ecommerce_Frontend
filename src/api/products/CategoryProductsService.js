const PAGE_SIZE = 8;

const mkVariation = (id, name, price, images) => ({
  id,
  product: { id, product_name: name, product_description: "Great value product", brand: 1 },
  product_color: "Default",
  product_size: "Standard",
  product_price: price,
  laptop_product: {
    laptop_processor: "",
    ram: "",
    ssd: "",
    hard_disk: "",
    graphics_card: "",
    screen_size: "",
    battery_life: "",
    weight: "",
    operating_system: "",
    others: ""
  },
  product_images: images.map((src, idx) => ({ id: idx + 1, product_image: src })),
  get_image_count: String(images.length),
  get_discounted_price: String(Math.round(price * 0.85)),
  stock: String(20 + (id % 50)),
});

const mkProduct = ({ id, name, cat, catSlug, sub, subSlug, img, price, slug }) => ({
  id,
  product_name: name,
  product_description: "High quality product at an affordable price.",
  product_discount: 15,
  product_category: {
    id: 100 + id,
    category_name: cat,
    category_image: `https://via.placeholder.com/300x200?text=${encodeURIComponent(cat)}`,
    slug: catSlug,
    is_discount_active: true,
    discount_start_date: new Date(Date.now() - 86400000).toISOString(),
    discount_end_date: new Date(Date.now() + 9 * 86400000).toISOString(),
  },
  sub_category: {
    id: 200 + id,
    sub_category_name: sub,
    sub_category_discount: 10,
    discount_start_date: new Date(Date.now() - 86400000).toISOString(),
    discount_end_date: new Date(Date.now() + 5 * 86400000).toISOString(),
    sub_category_image: `https://via.placeholder.com/200x150?text=${encodeURIComponent(sub)}`,
    is_discount_active: true,
    slug: subSlug,
  },
  is_top_selling: false,
  weekly_drop: false,
  exciting_deals: "",
  featured_product: false,
  faq: "",
  brand: { brand_name: "Generic", brand_image: "https://via.placeholder.com/150?text=Brand", slug: "generic" },
  product_variations: [
    mkVariation(1000 + id, name, price, [img, img]),
  ],
  business_product: { minimum_bulk_quantity: 10, business_discount: 5 },
  age_restriction: false,
  get_rating_info: "4.3",
  handpicked: true,
  free_delivery: true,
  best_seller: false,
  slug,
  tag: { product_tag: "category" },
  has_cashback: true,
  excitingdeal_start_date: new Date(Date.now() - 86400000).toISOString(),
  excitingdeal_end_date: new Date(Date.now() + 3 * 86400000).toISOString(),
});

const DATASET = {
  "mens-fashion": [
    mkProduct({
      id: 1,
      name: "Slim Fit Casual Shirt",
      cat: "Men's Fashion",
      catSlug: "mens-fashion",
      sub: "Casual Shirts",
      subSlug: "mens-casual-shirts",
      img: "https://via.placeholder.com/260?text=Casual+Shirt",
      price: 1499,
      slug: "slim-fit-casual-shirt",
    }),
    mkProduct({
      id: 2,
      name: "Classic Formal Shoes",
      cat: "Men's Fashion",
      catSlug: "mens-fashion",
      sub: "Formal Shoes",
      subSlug: "mens-formal-shoes",
      img: "https://via.placeholder.com/260?text=Formal+Shoes",
      price: 2599,
      slug: "classic-formal-shoes",
    }),
  ],
  "electronics": [
    mkProduct({
      id: 11,
      name: "5G Android Smartphone",
      cat: "Electronics",
      catSlug: "electronics",
      sub: "Smartphones",
      subSlug: "electronics-smartphones",
      img: "https://via.placeholder.com/260?text=Smartphone",
      price: 18999,
      slug: "5g-android-smartphone",
    }),
    mkProduct({
      id: 12,
      name: "14-inch Thin Laptop",
      cat: "Electronics",
      catSlug: "electronics",
      sub: "Laptops",
      subSlug: "electronics-laptops",
      img: "https://via.placeholder.com/260?text=Laptop",
      price: 42999,
      slug: "14-inch-thin-laptop",
    }),
  ],
  "womens-fashion": [
    mkProduct({
      id: 21,
      name: "Floral Summer Dress",
      cat: "Women's Fashion",
      catSlug: "womens-fashion",
      sub: "Dresses",
      subSlug: "womens-dresses",
      img: "https://via.placeholder.com/260?text=Summer+Dress",
      price: 1799,
      slug: "floral-summer-dress",
    }),
    mkProduct({
      id: 22,
      name: "Leather Handbag",
      cat: "Women's Fashion",
      catSlug: "womens-fashion",
      sub: "Handbags",
      subSlug: "womens-handbags",
      img: "https://via.placeholder.com/260?text=Handbag",
      price: 3499,
      slug: "leather-handbag",
    }),
  ],
  "home-kitchen": [
    mkProduct({
      id: 31,
      name: "Nonstick Cookware Set",
      cat: "Home & Kitchen",
      catSlug: "home-kitchen",
      sub: "Cookware",
      subSlug: "cookware",
      img: "https://via.placeholder.com/260?text=Cookware",
      price: 2599,
      slug: "nonstick-cookware-set",
    }),
    mkProduct({
      id: 32,
      name: "Automatic Coffee Maker",
      cat: "Home & Kitchen",
      catSlug: "home-kitchen",
      sub: "Appliances",
      subSlug: "kitchen-appliances",
      img: "https://via.placeholder.com/260?text=Coffee+Maker",
      price: 4999,
      slug: "automatic-coffee-maker",
    }),
  ],
  "sports-fitness": [
    mkProduct({
      id: 41,
      name: "Adjustable Dumbbell Set",
      cat: "Sports & Fitness",
      catSlug: "sports-fitness",
      sub: "Gym Equipment",
      subSlug: "gym-equipment",
      img: "https://via.placeholder.com/260?text=Dumbbells",
      price: 2999,
      slug: "adjustable-dumbbell-set",
    }),
    mkProduct({
      id: 42,
      name: "Yoga Mat Pro",
      cat: "Sports & Fitness",
      catSlug: "sports-fitness",
      sub: "Outdoor & Yoga",
      subSlug: "outdoor-yoga",
      img: "https://via.placeholder.com/260?text=Yoga+Mat",
      price: 899,
      slug: "yoga-mat-pro",
    }),
  ],
  // Category: Medical & Pharmacy
  "medical-pharmacy": [
    mkProduct({
      id: 51,
      name: "Acetaminophen Pain Relief (500mg, 100 caplets)",
      cat: "Medical & Pharmacy",
      catSlug: "medical-pharmacy",
      sub: "OTC Medicines",
      subSlug: "medical-otc",
      img: "https://via.placeholder.com/260?text=Pain+Relief",
      price: 499,
      slug: "acetaminophen-500mg-100",
    }),
    mkProduct({
      id: 52,
      name: "Vitamin C 1000mg (60 tablets)",
      cat: "Medical & Pharmacy",
      catSlug: "medical-pharmacy",
      sub: "Vitamins & Supplements",
      subSlug: "medical-vitamins",
      img: "https://via.placeholder.com/260?text=Vitamin+C",
      price: 699,
      slug: "vitamin-c-1000-60",
    }),
    mkProduct({
      id: 53,
      name: "Digital Thermometer (Fast Read)",
      cat: "Medical & Pharmacy",
      catSlug: "medical-pharmacy",
      sub: "Health Devices",
      subSlug: "medical-devices",
      img: "https://via.placeholder.com/260?text=Thermometer",
      price: 899,
      slug: "digital-thermometer-fast-read",
    }),
  ],
};

// Create subcategory keys based on products above
["mens-casual-shirts","mens-formal-shoes","electronics-smartphones","electronics-laptops","womens-dresses","womens-handbags","cookware","kitchen-appliances","gym-equipment","outdoor-yoga","medical-otc","medical-vitamins","medical-devices"].forEach((sub) => {
  if (!DATASET[sub]) {
    DATASET[sub] = Object.values(DATASET).flat().filter(p => p?.sub_category?.slug === sub);
  }
});

const paginate = (arr = [], page = 1, pageSize = PAGE_SIZE) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const slice = arr.slice(start, end);
  return {
    count: arr.length,
    next: end < arr.length ? `?page=${page + 1}` : null,
    previous: start > 0 ? `?page=${page - 1}` : null,
    results: slice,
  };
};

export const getProductsByCategory = async (categorySlug, page = 1) => {
  await new Promise((r) => setTimeout(r, 300));
  const list = DATASET[categorySlug] || [];
  return paginate(list, page, PAGE_SIZE);
};

export const getProductsBySubcategory = async (subcategorySlug, page = 1) => {
  await new Promise((r) => setTimeout(r, 300));
  const list = DATASET[subcategorySlug] || [];
  return paginate(list, page, PAGE_SIZE);
};

// Aggregate all category products (across top-level categories)
const CATEGORY_SLUGS = ["mens-fashion","womens-fashion","electronics","home-kitchen","sports-fitness","medical-pharmacy"];
export const getAllProducts = async (page = 1) => {
  await new Promise((r) => setTimeout(r, 300));
  const seen = new Set();
  const all = [];
  CATEGORY_SLUGS.forEach((slug) => {
    const arr = DATASET[slug] || [];
    arr.forEach((p) => {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        all.push(p);
      }
    });
  });
  return paginate(all, page, PAGE_SIZE);
};


