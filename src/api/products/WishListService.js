import API from "../../axios";

export const getWishlist = async (page = 1) => {
  console.log("Dummy wishlist page:", page);

  return {
    count: 123,
    next: "http://api.example.org/accounts/?page=4",
    previous: "http://api.example.org/accounts/?page=2",
    results: [
      {
        id: 1,
        products: [
          {
            id: 10,
            product_name: "Wishlist Gaming Laptop",
            product_description: "Powerful laptop with RTX graphics for gaming.",
            product_discount: 25,

            product_category: {
              id: 2,
              category_name: "Electronics",
              category_image: "https://via.placeholder.com/300x200?text=Electronics",
              slug: "electronics",
              is_discount_active: true,
              discount_start_date: "2025-11-20T02:15:24.897Z",
              discount_end_date: "2025-12-05T02:15:24.897Z",
            },

            sub_category: {
              id: 5,
              sub_category_name: "Laptops",
              sub_category_discount: 10,
              discount_start_date: "2025-11-20T02:15:24.897Z",
              discount_end_date: "2025-12-10T02:15:24.897Z",
              sub_category_image: "https://via.placeholder.com/200x150?text=Laptops",
              is_discount_active: true,
              slug: "laptops",
            },

            is_top_selling: true,
            weekly_drop: false,
            exciting_deals: "Mega Laptop Sale",
            featured_product: true,
            faq: "Does it support HDMI 2.1? → Yes.",

            brand: {
              brand_name: "TechPro",
              brand_image: "https://via.placeholder.com/150?text=TechPro",
              slug: "techpro",
            },

            product_variations: [
              {
                id: 101,
                product: {
                  id: 10,
                  product_name: "Wishlist Gaming Laptop",
                  product_description: "Smooth 144Hz display.",
                  brand: 1,
                },
                product_color: "Black",
                product_size: "15-inch",
                product_price: 1800,
                laptop_product: {
                  laptop_processor: "Intel i7",
                  ram: "16GB",
                  ssd: "1TB",
                  hard_disk: "",
                  graphics_card: "RTX 4070",
                  screen_size: "15.6\"",
                  battery_life: "8 hours",
                  weight: "2.0kg",
                  operating_system: "Windows 11",
                  others: "RGB keyboard",
                },
                product_images: [
                  { id: 1, product_image: "https://via.placeholder.com/300?text=Laptop1" },
                ],
                get_image_count: "1",
                get_discounted_price: "1350",
                stock: "7",
              },
            ],

            business_product: {
              minimum_bulk_quantity: 5,
              business_discount: 10,
            },

            age_restriction: false,
            get_rating_info: "4.8",
            handpicked: true,
            free_delivery: true,
            best_seller: true,
            slug: "wishlist-gaming-laptop",
            tag: { product_tag: "wishlist" },
            has_cashback: true,
            excitingdeal_start_date: "2025-11-20T02:15:24.897Z",
            excitingdeal_end_date: "2025-11-30T02:15:24.897Z",
          },
        ],
      },
    ],
  };
};

export const addToWishlist = async (payload) => {
  console.log("Dummy add to wishlist:", payload);

  return {
    success: true,
    message: "Product added to wishlist (dummy).",
  };
};


/**
 * GET /api/v1/products/wishlist/?page=1
 * Returns: { count, next, previous, results: [ { id, products: [...] } ] }
 */
// export const getWishlist = async (page = 1) => {
//   try {
//     const response = await API.get("/v1/products/wishlist/", {
//       params: { page },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching wishlist:", error);
//     throw error;
//   }
// };

// /**
//  * POST /api/v1/products/wishlist/
//  * Payload shape depends on your backend (e.g. { product_id: 1 } or similar)
//  * I'm keeping it generic so you can pass whatever your API expects.
//  */
// export const addToWishlist = async (payload) => {
//   try {
//     const response = await API.post("/v1/products/wishlist/", payload);
//     return response.data;
//   } catch (error) {
//     console.error("Error adding to wishlist:", error);
//     throw error;
//   }
// };
