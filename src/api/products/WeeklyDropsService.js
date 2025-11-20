import API from "../../axios";

export const getWeeklyDrops = async (page = 1) => {
  console.log("Dummy Weekly Drops page:", page);

  return {
    count: 123,
    next: "http://api.example.org/accounts/?page=4",
    previous: "http://api.example.org/accounts/?page=2",
    results: [
      {
        id: 1,
        product_name: "Weekly Drop – Smartwatch",
        product_description: "Newest edition smartwatch with health & fitness tracking.",
        product_discount: 20,

        product_category: {
          id: 50,
          category_name: "Wearables",
          category_image: "https://via.placeholder.com/300x200?text=Wearables",
          slug: "wearables",
          is_discount_active: true,
          discount_start_date: "2025-11-20T02:12:59.416Z",
          discount_end_date: "2025-12-01T02:12:59.416Z",
        },

        sub_category: {
          id: 80,
          sub_category_name: "Smartwatches",
          sub_category_discount: 10,
          discount_start_date: "2025-11-21T02:12:59.416Z",
          discount_end_date: "2025-12-05T02:12:59.416Z",
          sub_category_image: "https://via.placeholder.com/200x150?text=Smartwatch",
          is_discount_active: true,
          slug: "smartwatches",
        },

        is_top_selling: false,
        weekly_drop: true,
        exciting_deals: "Weekly Deals Drop",
        featured_product: true,
        faq: "Is it waterproof? → Yes, up to 50m.",

        brand: {
          brand_name: "TimeTech",
          brand_image: "https://via.placeholder.com/150?text=TimeTech",
          slug: "timetech",
        },

        product_variations: [
          {
            id: 301,
            product: {
              id: 1,
              product_name: "Weekly Drop – Smartwatch",
              product_description: "Updated tracking features.",
              brand: 1,
            },
            product_color: "Black",
            product_size: "42mm",
            product_price: 199,

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
              others: "",
            },

            product_images: [
              { id: 1, product_image: "https://via.placeholder.com/300?text=Watch1" },
            ],

            get_image_count: "1",
            get_discounted_price: "159",
            stock: "25",
          },
        ],

        business_product: {
          minimum_bulk_quantity: 20,
          business_discount: 10,
        },

        age_restriction: false,
        get_rating_info: "4.6",
        handpicked: true,
        free_delivery: true,
        best_seller: false,
        slug: "weekly-drop-smartwatch",
        tag: { product_tag: "weekly-drop" },
        has_cashback: true,

        excitingdeal_start_date: "2025-11-20T02:12:59.416Z",
        excitingdeal_end_date: "2025-11-30T02:12:59.416Z",
      },
    ],
  };
};


// GET /api/v1/products/weekly-drops/?page=1
// export const getWeeklyDrops = async (page = 1) => {
//   try {
//     const response = await API.get("/v1/products/weekly-drops/", {
//       params: { page }, // ?page=1
//     });
//     return response.data; // {count, next, previous, results: [...]}
//   } catch (error) {
//     console.error("Error fetching weekly drops:", error);
//     throw error;
//   }
// };
