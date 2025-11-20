import API from "../../axios";

// Simulates: GET /api/v1/products/most-sold-product/
export const getMostSoldProducts = async () => {
  return [
    {
      id: 1,
      product_name: "Ultra Comfort Gaming Chair",
      product_description: "Ergonomic gaming chair with lumbar support and adjustable armrests.",
      product_discount: 20,

      product_category: {
        id: 10,
        category_name: "Furniture",
        category_image: "https://via.placeholder.com/300x200?text=Furniture",
        slug: "furniture",
        is_discount_active: true,
        discount_start_date: "2025-11-20T01:43:30.895Z",
        discount_end_date: "2025-12-05T01:43:30.895Z"
      },

      sub_category: {
        id: 21,
        sub_category_name: "Gaming Chairs",
        sub_category_discount: 10,
        discount_start_date: "2025-11-20T01:43:30.895Z",
        discount_end_date: "2025-12-10T01:43:30.895Z",
        sub_category_image: "https://via.placeholder.com/200x150?text=Gaming+Chairs",
        is_discount_active: true,
        slug: "gaming-chairs"
      },

      is_top_selling: true,
      weekly_drop: true,
      exciting_deals: "Festival Gaming Bonanza",
      featured_product: false,
      faq: "Assembly required? → Yes, basic tools included.",

      brand: {
        brand_name: "ProSeat",
        brand_image: "https://via.placeholder.com/150?text=ProSeat",
        slug: "proseat"
      },

      product_variations: [
        {
          id: 101,
          product: {
            id: 1,
            product_name: "Ultra Comfort Gaming Chair",
            product_description: "Ergonomic gaming chair for long sessions.",
            brand: 1
          },
          product_color: "Black/Red",
          product_size: "Standard",
          product_price: 299,

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

          product_images: [
            { id: 1, product_image: "https://via.placeholder.com/300?text=Chair1" },
            { id: 2, product_image: "https://via.placeholder.com/300?text=Chair2" }
          ],

          get_image_count: "2",
          get_discounted_price: "239",
          stock: "120"
        }
      ],

      business_product: {
        minimum_bulk_quantity: 10,
        business_discount: 5
      },

      age_restriction: false,
      get_rating_info: "4.8",
      handpicked: true,
      free_delivery: true,
      best_seller: true,
      slug: "ultra-comfort-gaming-chair",

      tag: {
        product_tag: "most-sold"
      },

      has_cashback: true,
      excitingdeal_start_date: "2025-11-20T01:43:30.895Z",
      excitingdeal_end_date: "2025-11-30T01:43:30.895Z"
    },

    {
      id: 2,
      product_name: "Noise Cancelling Earbuds",
      product_description: "True wireless earbuds with active noise cancellation.",
      product_discount: 15,

      product_category: {
        id: 11,
        category_name: "Electronics",
        category_image: "https://via.placeholder.com/300x200?text=Electronics",
        slug: "electronics",
        is_discount_active: true,
        discount_start_date: "2025-11-18T01:43:30.895Z",
        discount_end_date: "2025-12-01T01:43:30.895Z"
      },

      sub_category: {
        id: 22,
        sub_category_name: "Earbuds",
        sub_category_discount: 5,
        discount_start_date: "2025-11-18T01:43:30.895Z",
        discount_end_date: "2025-11-28T01:43:30.895Z",
        sub_category_image: "https://via.placeholder.com/200x150?text=Earbuds",
        is_discount_active: true,
        slug: "earbuds"
      },

      is_top_selling: true,
      weekly_drop: false,
      exciting_deals: "Black Friday Electronics",
      featured_product: true,
      faq: "Water resistant? → IPX4.",

      brand: {
        brand_name: "SoundPulse",
        brand_image: "https://via.placeholder.com/150?text=SoundPulse",
        slug: "soundpulse"
      },

      product_variations: [
        {
          id: 102,
          product: {
            id: 2,
            product_name: "Noise Cancelling Earbuds",
            product_description: "Compact, long battery life.",
            brand: 2
          },
          product_color: "White",
          product_size: "Standard",
          product_price: 129,

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

          product_images: [
            { id: 3, product_image: "https://via.placeholder.com/300?text=Earbuds1" }
          ],

          get_image_count: "1",
          get_discounted_price: "109",
          stock: "300"
        }
      ],

      business_product: {
        minimum_bulk_quantity: 20,
        business_discount: 8
      },

      age_restriction: false,
      get_rating_info: "4.5",
      handpicked: true,
      free_delivery: true,
      best_seller: true,
      slug: "noise-cancelling-earbuds",

      tag: {
        product_tag: "bestseller"
      },

      has_cashback: true,
      excitingdeal_start_date: "2025-11-19T01:43:30.895Z",
      excitingdeal_end_date: "2025-11-27T01:43:30.895Z"
    }
  ];
};


// GET: /api/v1/products/most-sold-product/
// export const getMostSoldProducts = async () => {
//   try {
//     const response = await API.get("/v1/products/most-sold-product/");
//     return response.data; 
//   } catch (error) {
//     console.error("Error fetching most sold products:", error);
//     throw error;
//   }
// };
