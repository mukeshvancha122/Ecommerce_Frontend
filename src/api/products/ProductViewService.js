import API from "../../axios";
import { translateProduct } from "../../utils/productTranslations";

export const getProductView = async (id, slug) => {
  console.log("Dummy product-view params:", { id, slug });

  const products = [
    {
      id: Number(id) || 1,
      product_name: "Ultimate Gaming Laptop",
      product_description: "High-performance gaming laptop with RTX graphics.",
      product_discount: 18,

      product_category: {
        id: 10,
        category_name: "Electronics",
        category_image: "https://via.placeholder.com/300x200?text=Electronics",
        slug: "electronics",
        is_discount_active: true,
        discount_start_date: "2025-11-20T01:49:36.342Z",
        discount_end_date: "2025-12-10T01:49:36.342Z"
      },

      sub_category: {
        id: 5,
        sub_category_name: "Laptops",
        sub_category_discount: 10,
        discount_start_date: "2025-11-20T01:49:36.342Z",
        discount_end_date: "2025-12-05T01:49:36.342Z",
        sub_category_image: "https://via.placeholder.com/200x150?text=Laptop",
        is_discount_active: true,
        slug: "laptops"
      },

      is_top_selling: true,
      weekly_drop: false,
      exciting_deals: "Holiday Mega Sale",
      featured_product: true,
      faq: "Does this support HDMI 2.1? → Yes.",

      brand: {
        brand_name: "TechPro",
        brand_image: "https://via.placeholder.com/150?text=Brand",
        slug: "techpro"
      },

      product_variations: [
        {
          id: 1001,
          product: {
            id: 1,
            product_name: "Ultimate Gaming Laptop",
            product_description: "Powerful GPU + cooling system.",
            brand: 1
          },
          product_color: "Black",
          product_size: "15-inch",
          product_price: 1999,

          laptop_product: {
            laptop_processor: "Intel i9 12th Gen",
            ram: "32GB",
            ssd: "1TB SSD",
            hard_disk: "",
            graphics_card: "NVIDIA RTX 4080",
            screen_size: "15.6-inch QHD",
            battery_life: "9 hours",
            weight: "2.1kg",
            operating_system: "Windows 11",
            others: "RGB keyboard, Thunderbolt 4"
          },

          product_images: [
            { id: 1, product_image: "https://via.placeholder.com/300?text=Laptop1" },
            { id: 2, product_image: "https://via.placeholder.com/300?text=Laptop2" }
          ],

          get_image_count: "2",
          get_discounted_price: "1599",
          stock: "32"
        }
      ],

      business_product: {
        minimum_bulk_quantity: 5,
        business_discount: 8
      },

      age_restriction: false,
      get_rating_info: "4.9",
      handpicked: true,
      free_delivery: true,
      best_seller: true,

      slug: slug || "ultimate-gaming-laptop",

      tag: { product_tag: "gaming" },

      has_cashback: true,
      excitingdeal_start_date: "2025-11-20T01:49:36.343Z",
      excitingdeal_end_date: "2025-11-30T01:49:36.343Z"
    }
  ];

  // Translate products based on current language
  return products.map(translateProduct);
};

// export const getProductView = async (id, slug) => {
//   try {
//     const response = await API.get("/v1/products/product-view/", {
//       params: { id, slug }
//     });
//     return response.data; // array
//   } catch (error) {
//     console.error("Error fetching product view:", error);
//     throw error;
//   }
// };
