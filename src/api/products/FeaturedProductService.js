import API from "../../axios";
export const getFeaturedProducts = async (page = 1) => {
  return {
    count: 123,
    next: `http://api.example.org/accounts/?page=${page + 1}`,
    previous: page > 1 ? `http://api.example.org/accounts/?page=${page - 1}` : null,

    results: [
      {
        id: 1,
        product_name: "Premium Wireless Headphones",
        product_description: "High-fidelity audio with noise cancellation.",
        product_discount: 30,

        product_category: {
          id: 10,
          category_name: "Electronics",
          category_image: "https://via.placeholder.com/300x200?text=Electronics",
          slug: "electronics",
          is_discount_active: true,
          discount_start_date: "2025-11-20T01:41:32.694Z",
          discount_end_date: "2025-12-10T01:41:32.694Z"
        },

        sub_category: {
          id: 22,
          sub_category_name: "Headphones",
          sub_category_discount: 12,
          discount_start_date: "2025-11-20T01:41:32.694Z",
          discount_end_date: "2025-12-05T01:41:32.694Z",
          sub_category_image: "https://via.placeholder.com/200x150?text=Headphones",
          is_discount_active: true,
          slug: "headphones"
        },

        is_top_selling: true,
        weekly_drop: false,
        exciting_deals: "Winter Blast",
        featured_product: true,
        faq: "What is the battery life? → 30 hours",

        brand: {
          brand_name: "AudioMax",
          brand_image: "https://via.placeholder.com/150?text=Brand",
          slug: "audiomax"
        },

        product_variations: [
          {
            id: 55,
            product: {
              id: 1,
              product_name: "Premium Wireless Headphones",
              product_description: "Noise-cancelling, comfortable fit.",
              brand: 1
            },

            product_color: "Black",
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
              { id: 1, product_image: "https://via.placeholder.com/300?text=Headphone1" },
              { id: 2, product_image: "https://via.placeholder.com/300?text=Headphone2" }
            ],

            get_image_count: "2",
            get_discounted_price: "220",
            stock: "50"
          }
        ],

        business_product: {
          minimum_bulk_quantity: 20,
          business_discount: 10
        },

        age_restriction: false,
        get_rating_info: "4.7",
        handpicked: true,
        free_delivery: true,
        best_seller: true,

        slug: "premium-wireless-headphones",
        tag: { product_tag: "electronics" },
        has_cashback: true,

        excitingdeal_start_date: "2025-11-20T01:41:32.694Z",
        excitingdeal_end_date: "2025-11-30T01:41:32.694Z"
      }
    ]
  };
};

// GET /api/v1/products/featured-product/?page=1 =-axios version
// export const getFeaturedProducts = async (page = 1) => {
//   try {
//     const response = await API.get("/v1/products/featured-product/", {
//       params: { page } // Adds ?page=1
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching featured products:", error);
//     throw error;
//   }
// };
