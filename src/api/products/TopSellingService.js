import API from "../../axios";

export const getTopSellingProducts = async (page = 1) => {
  console.log("Dummy top-selling page:", page);

  return {
    count: 123,
    next: "http://api.example.org/accounts/?page=4",
    previous: "http://api.example.org/accounts/?page=2",
    results: [
      {
        id: 1,
        product_name: "Top Selling 4K Smart TV",
        product_description: "55-inch 4K UHD Smart TV with HDR and built-in apps.",
        product_discount: 25,

        product_category: {
          id: 10,
          category_name: "Electronics",
          category_image: "https://via.placeholder.com/300x200?text=Electronics",
          slug: "electronics",
          is_discount_active: true,
          discount_start_date: "2025-11-20T02:10:51.025Z",
          discount_end_date: "2025-12-10T02:10:51.025Z",
        },

        sub_category: {
          id: 5,
          sub_category_name: "Televisions",
          sub_category_discount: 15,
          discount_start_date: "2025-11-20T02:10:51.025Z",
          discount_end_date: "2025-12-05T02:10:51.025Z",
          sub_category_image: "https://via.placeholder.com/200x150?text=TV",
          is_discount_active: true,
          slug: "televisions",
        },

        is_top_selling: true,
        weekly_drop: true,
        exciting_deals: "Top Selling Electronics",
        featured_product: true,
        faq: "Wall mount included? → Yes.",

        brand: {
          brand_name: "ViewMax",
          brand_image: "https://via.placeholder.com/150?text=ViewMax",
          slug: "viewmax",
        },

        product_variations: [
          {
            id: 101,
            product: {
              id: 1,
              product_name: "Top Selling 4K Smart TV",
              product_description: "Immersive viewing with HDR.",
              brand: 1,
            },
            product_color: "Black",
            product_size: "55 inch",
            product_price: 699,

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
              { id: 1, product_image: "https://via.placeholder.com/300?text=TV1" },
            ],

            get_image_count: "1",
            get_discounted_price: "549",
            stock: "40",
          },
        ],

        business_product: {
          minimum_bulk_quantity: 10,
          business_discount: 10,
        },

        age_restriction: false,
        get_rating_info: "4.8",
        handpicked: true,
        free_delivery: true,
        best_seller: true,
        slug: "top-selling-4k-smart-tv",
        tag: { product_tag: "top-selling" },
        has_cashback: true,
        excitingdeal_start_date: "2025-11-20T02:10:51.025Z",
        excitingdeal_end_date: "2025-11-30T02:10:51.025Z",
      },
    ],
  };
};


// GET /api/v1/products/top-selling/?page=1
// export const getTopSellingProducts = async (page = 1) => {
//   try {
//     const response = await API.get("/v1/products/top-selling/", {
//       params: { page }, // ?page=1
//     });
//     return response.data; // { count, next, previous, results: [...] }
//   } catch (error) {
//     console.error("Error fetching top selling products:", error);
//     throw error;
//   }
// };