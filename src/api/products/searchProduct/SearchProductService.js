export const searchProducts = async (filters = {}) => {
  console.log("Dummy product search filters:", filters);

  return {
    count: 123,
    next: "http://api.example.org/accounts/?page=4",
    previous: "http://api.example.org/accounts/?page=2",

    results: [
      // 1) Fashion - Shoes
      {
        id: 1,
        product_name: "Nike Air Jordan",
        product_description: "Premium basketball shoes with high ankle support.",
        product_discount: 30,
        product_category: {
          id: 10,
          category_name: "Shoes",
          category_image: "https://via.placeholder.com/300x200?text=Shoes",
          slug: "shoes",
          is_discount_active: true,
          discount_start_date: "2025-11-20T01:54:37.955Z",
          discount_end_date: "2025-12-05T01:54:37.955Z"
        },
        sub_category: {
          id: 15,
          sub_category_name: "Sports Shoes",
          sub_category_discount: 15,
          discount_start_date: "2025-11-21T01:54:37.955Z",
          discount_end_date: "2025-12-10T01:54:37.955Z",
          sub_category_image: "https://via.placeholder.com/150x150?text=Sports",
          is_discount_active: true,
          slug: "sports-shoes"
        },
        is_top_selling: true,
        weekly_drop: false,
        exciting_deals: "Winter Sports Sale",
        featured_product: true,
        faq: "Are these waterproof? → Yes.",
        brand: {
          brand_name: "Nike",
          brand_image: "https://via.placeholder.com/150?text=Nike",
          slug: "nike"
        },
        product_variations: [
          {
            id: 100,
            product: { id: 1, product_name: "Nike Air Jordan", product_description: "High performance sports shoes.", brand: 1 },
            product_color: "Black & Red",
            product_size: "10",
            product_price: 250,
            laptop_product: { laptop_processor: "", ram: "", ssd: "", hard_disk: "", graphics_card: "", screen_size: "", battery_life: "", weight: "", operating_system: "", others: "" },
            product_images: [
              { id: 1, product_image: "https://via.placeholder.com/250?text=Jordan1" },
              { id: 2, product_image: "https://via.placeholder.com/250?text=Jordan2" }
            ],
            get_image_count: "2",
            get_discounted_price: "199",
            stock: "24"
          }
        ],
        business_product: { minimum_bulk_quantity: 10, business_discount: 8 },
        age_restriction: false,
        get_rating_info: "4.7",
        handpicked: true,
        free_delivery: filters.free_delivery || true,
        best_seller: true,
        slug: "nike-air-jordan",
        tag: { product_tag: "sports" },
        has_cashback: true,
        excitingdeal_start_date: "2025-11-20T01:54:37.955Z",
        excitingdeal_end_date: "2025-11-25T01:54:37.955Z"
      },
      // 2) Electronics - Smartphone
      {
        id: 2,
        product_name: "5G Android Smartphone",
        product_description: "6.5-inch display, 8GB RAM, 128GB storage.",
        product_discount: 15,
        product_category: {
          id: 20,
          category_name: "Electronics",
          category_image: "https://via.placeholder.com/300x200?text=Electronics",
          slug: "electronics",
          is_discount_active: true,
          discount_start_date: "2025-11-18T10:00:00Z",
          discount_end_date: "2025-12-10T10:00:00Z"
        },
        sub_category: {
          id: 21,
          sub_category_name: "Smartphones",
          sub_category_discount: 10,
          discount_start_date: "2025-11-18T10:00:00Z",
          discount_end_date: "2025-12-08T10:00:00Z",
          sub_category_image: "https://via.placeholder.com/150x150?text=Phone",
          is_discount_active: true,
          slug: "smartphones"
        },
        brand: { brand_name: "OnePlus", brand_image: "https://via.placeholder.com/150?text=Brand", slug: "oneplus" },
        product_variations: [
          {
            id: 201,
            product: { id: 2, product_name: "5G Android Smartphone", product_description: "Fast device", brand: 2 },
            product_color: "Blue",
            product_size: "128GB",
            product_price: 18999,
            laptop_product: { laptop_processor: "", ram: "", ssd: "", hard_disk: "", graphics_card: "", screen_size: "", battery_life: "", weight: "", operating_system: "", others: "" },
            product_images: [{ id: 1, product_image: "https://via.placeholder.com/300?text=Phone1" }],
            get_image_count: "1",
            get_discounted_price: "16999",
            stock: "32"
          }
        ],
        business_product: { minimum_bulk_quantity: 5, business_discount: 5 },
        get_rating_info: "4.5",
        slug: "5g-android-smartphone",
        tag: { product_tag: "electronics" },
        has_cashback: true
      },
      // 3) Electronics - Laptops
      {
        id: 3,
        product_name: "14-inch Thin Laptop",
        product_description: "Lightweight laptop for everyday use.",
        product_discount: 12,
        product_category: { id: 20, category_name: "Electronics", category_image: "https://via.placeholder.com/300x200?text=Electronics", slug: "electronics", is_discount_active: true, discount_start_date: "2025-11-18T10:00:00Z", discount_end_date: "2025-12-10T10:00:00Z" },
        sub_category: { id: 22, sub_category_name: "Laptops", sub_category_discount: 8, discount_start_date: "2025-11-18T10:00:00Z", discount_end_date: "2025-12-08T10:00:00Z", sub_category_image: "https://via.placeholder.com/150x150?text=Laptop", is_discount_active: true, slug: "laptops" },
        brand: { brand_name: "Acer", brand_image: "https://via.placeholder.com/150?text=Acer", slug: "acer" },
        product_variations: [
          {
            id: 301,
            product: { id: 3, product_name: "14-inch Thin Laptop", product_description: "Everyday laptop", brand: 3 },
            product_color: "Silver",
            product_size: "8GB/512GB",
            product_price: 42999,
            laptop_product: { laptop_processor: "Intel i5", ram: "8GB", ssd: "512GB", hard_disk: "", graphics_card: "Integrated", screen_size: "14", battery_life: "10h", weight: "1.3kg", operating_system: "Windows 11", others: "" },
            product_images: [{ id: 1, product_image: "https://via.placeholder.com/300?text=Laptop" }],
            get_image_count: "1",
            get_discounted_price: "38999",
            stock: "20"
          }
        ],
        get_rating_info: "4.4",
        slug: "14-inch-thin-laptop",
        tag: { product_tag: "computers" }
      },
      // 4) Home & Kitchen - Cookware
      {
        id: 4,
        product_name: "Nonstick Cookware Set",
        product_description: "Durable nonstick pots and pans set.",
        product_discount: 18,
        product_category: { id: 30, category_name: "Home & Kitchen", category_image: "https://via.placeholder.com/300x200?text=Home+%26+Kitchen", slug: "home-kitchen", is_discount_active: true, discount_start_date: "2025-11-19T01:00:00Z", discount_end_date: "2025-12-10T01:00:00Z" },
        sub_category: { id: 31, sub_category_name: "Cookware", sub_category_discount: 10, discount_start_date: "2025-11-20T01:00:00Z", discount_end_date: "2025-12-08T01:00:00Z", sub_category_image: "https://via.placeholder.com/150x150?text=Cookware", is_discount_active: true, slug: "cookware" },
        brand: { brand_name: "Prestige", brand_image: "https://via.placeholder.com/150?text=Brand", slug: "prestige" },
        product_variations: [
          {
            id: 401,
            product: { id: 4, product_name: "Nonstick Cookware Set", product_description: "Kitchen starter", brand: 4 },
            product_color: "Black",
            product_size: "7-piece",
            product_price: 2599,
            laptop_product: { laptop_processor: "", ram: "", ssd: "", hard_disk: "", graphics_card: "", screen_size: "", battery_life: "", weight: "", operating_system: "", others: "" },
            product_images: [{ id: 1, product_image: "https://via.placeholder.com/300?text=Cookware" }],
            get_image_count: "1",
            get_discounted_price: "2199",
            stock: "50"
          }
        ],
        get_rating_info: "4.3",
        slug: "nonstick-cookware-set",
        tag: { product_tag: "kitchen" }
      },
      // 5) Beauty - Serum
      {
        id: 5,
        product_name: "Vitamin C Face Serum",
        product_description: "Brightening serum with hyaluronic acid.",
        product_discount: 20,
        product_category: { id: 40, category_name: "Beauty", category_image: "https://via.placeholder.com/300x200?text=Beauty", slug: "beauty", is_discount_active: true, discount_start_date: "2025-11-18T01:00:00Z", discount_end_date: "2025-12-05T01:00:00Z" },
        sub_category: { id: 41, sub_category_name: "Skin Care", sub_category_discount: 10, discount_start_date: "2025-11-18T01:00:00Z", discount_end_date: "2025-12-01T01:00:00Z", sub_category_image: "https://via.placeholder.com/150x150?text=Skincare", is_discount_active: true, slug: "skin-care" },
        brand: { brand_name: "Bare Anatomy", brand_image: "https://via.placeholder.com/150?text=Brand", slug: "bare-anatomy" },
        product_variations: [
          {
            id: 501,
            product: { id: 5, product_name: "Vitamin C Face Serum", product_description: "Brightening serum", brand: 5 },
            product_color: "Transparent",
            product_size: "30ml",
            product_price: 799,
            laptop_product: { laptop_processor: "", ram: "", ssd: "", hard_disk: "", graphics_card: "", screen_size: "", battery_life: "", weight: "", operating_system: "", others: "" },
            product_images: [{ id: 1, product_image: "https://via.placeholder.com/300?text=Serum" }],
            get_image_count: "1",
            get_discounted_price: "649",
            stock: "80"
          }
        ],
        get_rating_info: "4.6",
        slug: "vitamin-c-face-serum",
        tag: { product_tag: "beauty" }
      },
      // 6) Sports & Fitness - Dumbbells
      {
        id: 6,
        product_name: "Adjustable Dumbbell Set",
        product_description: "Pair of adjustable dumbbells for home workouts.",
        product_discount: 25,
        product_category: { id: 50, category_name: "Sports & Fitness", category_image: "https://via.placeholder.com/300x200?text=Sports+%26+Fitness", slug: "sports-fitness", is_discount_active: true, discount_start_date: "2025-11-20T01:00:00Z", discount_end_date: "2025-12-12T01:00:00Z" },
        sub_category: { id: 51, sub_category_name: "Gym Equipment", sub_category_discount: 10, discount_start_date: "2025-11-20T01:00:00Z", discount_end_date: "2025-12-12T01:00:00Z", sub_category_image: "https://via.placeholder.com/150x150?text=Gym", is_discount_active: true, slug: "gym-equipment" },
        brand: { brand_name: "FitPro", brand_image: "https://via.placeholder.com/150?text=FitPro", slug: "fitpro" },
        product_variations: [
          {
            id: 601,
            product: { id: 6, product_name: "Adjustable Dumbbell Set", product_description: "Home workout essential", brand: 6 },
            product_color: "Black",
            product_size: "Up to 20kg",
            product_price: 2999,
            laptop_product: { laptop_processor: "", ram: "", ssd: "", hard_disk: "", graphics_card: "", screen_size: "", battery_life: "", weight: "", operating_system: "", others: "" },
            product_images: [{ id: 1, product_image: "https://via.placeholder.com/300?text=Dumbbells" }],
            get_image_count: "1",
            get_discounted_price: "2499",
            stock: "40"
          }
        ],
        slug: "adjustable-dumbbell-set",
        tag: { product_tag: "fitness" }
      },
      // 7) Medical & Pharmacy - Vitamin
      {
        id: 7,
        product_name: "Vitamin D3 2000 IU",
        product_description: "Daily vitamin D supplementation.",
        product_discount: 10,
        product_category: { id: 60, category_name: "Medical & Pharmacy", category_image: "https://via.placeholder.com/300x200?text=Medical", slug: "medical-pharmacy", is_discount_active: true, discount_start_date: "2025-11-19T01:00:00Z", discount_end_date: "2025-12-05T01:00:00Z" },
        sub_category: { id: 61, sub_category_name: "Vitamins & Supplements", sub_category_discount: 5, discount_start_date: "2025-11-19T01:00:00Z", discount_end_date: "2025-12-01T01:00:00Z", sub_category_image: "https://via.placeholder.com/150x150?text=Vitamins", is_discount_active: true, slug: "medical-vitamins" },
        brand: { brand_name: "NutriMax", brand_image: "https://via.placeholder.com/150?text=Brand", slug: "nutrimax" },
        product_variations: [
          {
            id: 701,
            product: { id: 7, product_name: "Vitamin D3 2000 IU", product_description: "Daily tablets", brand: 7 },
            product_color: "White",
            product_size: "120 tablets",
            product_price: 699,
            laptop_product: { laptop_processor: "", ram: "", ssd: "", hard_disk: "", graphics_card: "", screen_size: "", battery_life: "", weight: "", operating_system: "", others: "" },
            product_images: [{ id: 1, product_image: "https://via.placeholder.com/300?text=VitaminD3" }],
            get_image_count: "1",
            get_discounted_price: "629",
            stock: "90"
          }
        ],
        slug: "vitamin-d3-2000",
        tag: { product_tag: "health" }
      },
      // 8) Books
      {
        id: 8,
        product_name: "Learn React the Right Way",
        product_description: "Beginner to advanced guide.",
        product_discount: 5,
        product_category: { id: 70, category_name: "Books", category_image: "https://via.placeholder.com/300x200?text=Books", slug: "books", is_discount_active: true, discount_start_date: "2025-11-15T01:00:00Z", discount_end_date: "2025-12-31T01:00:00Z" },
        sub_category: { id: 71, sub_category_name: "Programming", sub_category_discount: 0, discount_start_date: "2025-11-15T01:00:00Z", discount_end_date: "2025-12-31T01:00:00Z", sub_category_image: "https://via.placeholder.com/150x150?text=Code", is_discount_active: true, slug: "programming" },
        brand: { brand_name: "TechPress", brand_image: "https://via.placeholder.com/150?text=TP", slug: "techpress" },
        product_variations: [
          {
            id: 801,
            product: { id: 8, product_name: "Learn React the Right Way", product_description: "Book", brand: 8 },
            product_color: "N/A",
            product_size: "Paperback",
            product_price: 499,
            laptop_product: { laptop_processor: "", ram: "", ssd: "", hard_disk: "", graphics_card: "", screen_size: "", battery_life: "", weight: "", operating_system: "", others: "" },
            product_images: [{ id: 1, product_image: "https://via.placeholder.com/300?text=React+Book" }],
            get_image_count: "1",
            get_discounted_price: "475",
            stock: "120"
          }
        ],
        slug: "learn-react-the-right-way",
        tag: { product_tag: "books" }
      },
      // 9) Toys
      {
        id: 9,
        product_name: "STEM Building Blocks Kit",
        product_description: "Creative building set for kids 8+.",
        product_discount: 22,
        product_category: { id: 80, category_name: "Toys", category_image: "https://via.placeholder.com/300x200?text=Toys", slug: "toys", is_discount_active: true, discount_start_date: "2025-11-16T01:00:00Z", discount_end_date: "2025-12-20T01:00:00Z" },
        sub_category: { id: 81, sub_category_name: "STEM Toys", sub_category_discount: 12, discount_start_date: "2025-11-16T01:00:00Z", discount_end_date: "2025-12-20T01:00:00Z", sub_category_image: "https://via.placeholder.com/150x150?text=STEM", is_discount_active: true, slug: "stem-toys" },
        brand: { brand_name: "Brainiacs", brand_image: "https://via.placeholder.com/150?text=B", slug: "brainiacs" },
        product_variations: [
          {
            id: 901,
            product: { id: 9, product_name: "STEM Building Blocks Kit", product_description: "Creative toy", brand: 9 },
            product_color: "Multi",
            product_size: "200 pieces",
            product_price: 1599,
            laptop_product: { laptop_processor: "", ram: "", ssd: "", hard_disk: "", graphics_card: "", screen_size: "", battery_life: "", weight: "", operating_system: "", others: "" },
            product_images: [{ id: 1, product_image: "https://via.placeholder.com/300?text=STEM+Kit" }],
            get_image_count: "1",
            get_discounted_price: "1249",
            stock: "75"
          }
        ],
        slug: "stem-building-blocks-kit",
        tag: { product_tag: "toys" }
      },
      // 10) Grocery
      {
        id: 10,
        product_name: "Organic Arabica Coffee Beans",
        product_description: "Whole bean coffee – medium roast, 1kg.",
        product_discount: 18,
        product_category: { id: 90, category_name: "Grocery", category_image: "https://via.placeholder.com/300x200?text=Grocery", slug: "grocery", is_discount_active: true, discount_start_date: "2025-11-15T01:00:00Z", discount_end_date: "2025-12-31T01:00:00Z" },
        sub_category: { id: 91, sub_category_name: "Beverages", sub_category_discount: 8, discount_start_date: "2025-11-15T01:00:00Z", discount_end_date: "2025-12-31T01:00:00Z", sub_category_image: "https://via.placeholder.com/150x150?text=Coffee", is_discount_active: true, slug: "beverages" },
        brand: { brand_name: "RoastLab", brand_image: "https://via.placeholder.com/150?text=RL", slug: "roastlab" },
        product_variations: [
          {
            id: 1001,
            product: { id: 10, product_name: "Organic Arabica Coffee Beans", product_description: "Medium roast beans", brand: 10 },
            product_color: "Brown",
            product_size: "1kg",
            product_price: 1299,
            laptop_product: { laptop_processor: "", ram: "", ssd: "", hard_disk: "", graphics_card: "", screen_size: "", battery_life: "", weight: "", operating_system: "", others: "" },
            product_images: [{ id: 1, product_image: "https://via.placeholder.com/300?text=Coffee+Beans" }],
            get_image_count: "1",
            get_discounted_price: "1065",
            stock: "60"
          }
        ],
        slug: "organic-arabica-coffee-beans",
        tag: { product_tag: "grocery" }
      }
    ]
  };
};



// GET /api/v1/products/search-product-view/
// export const searchProducts = async (filters = {}) => {
//   try {
//     const response = await API.get("/v1/products/search-product-view/", {
//       params: {
//         attributes: filters.attributes,
//         brand: filters.brand,
//         category: filters.category,
//         free_delivery: filters.free_delivery,
//         handpicked: filters.handpicked,
//         in_stock: filters.in_stock,
//         max_price: filters.max_price,
//         min_price: filters.min_price,
//         page: filters.page,
//         page_size: filters.page_size,
//         product_name: filters.product_name,
//         products: filters.products,
//         ratings: filters.ratings
//       }
//     });

//     return response.data; // pagination {count,next,prev,results}
//   } catch (error) {
//     console.error("Error fetching searched products:", error);
//     throw error;
//   }
// };