import API from "../../axios";

export const getExcitingDeals = async (page = 1) => {
  return {
    count: 123,
    next: `http://api.example.org/accounts/?page=${page + 1}`,
    previous: page > 1 ? `http://api.example.org/accounts/?page=${page - 1}` : null,
    results: [
      {
        id: 1,
        product_name: "Sample Laptop",
        product_description: "High-performance laptop with latest processor.",
        product_discount: 25,

        product_category: {
          id: 10,
          category_name: "Electronics",
          category_image: "https://via.placeholder.com/300x200?text=Electronics",
          slug: "electronics",
          is_discount_active: true,
          discount_start_date: "2025-11-20T01:39:25.312Z",
          discount_end_date: "2025-12-01T01:39:25.312Z"
        },

        sub_category: {
          id: 55,
          sub_category_name: "Laptops",
          sub_category_discount: 10,
          discount_start_date: "2025-11-20T01:39:25.312Z",
          discount_end_date: "2025-12-10T01:39:25.312Z",
          sub_category_image: "https://via.placeholder.com/200x150?text=Laptops",
          is_discount_active: true,
          slug: "laptops"
        },

        is_top_selling: true,
        weekly_drop: true,
        exciting_deals: "Electronics Fest",
        featured_product: true,
        faq: "This is an FAQ sample.",

        brand: {
          brand_name: "TechBrand",
          brand_image: "https://via.placeholder.com/150?text=Brand",
          slug: "techbrand"
        },

        product_variations: [
          {
            id: 101,
            product: {
              id: 1,
              product_name: "Sample Laptop",
              product_description: "High-performance computing.",
              brand: 1
            },
            product_color: "Silver",
            product_size: "15 inch",
            product_price: 1200,

            laptop_product: {
              laptop_processor: "Intel i7",
              ram: "16GB",
              ssd: "512GB",
              hard_disk: "None",
              graphics_card: "NVIDIA GTX 1650",
              screen_size: "15.6 inch",
              battery_life: "10 hours",
              weight: "1.8kg",
              operating_system: "Windows 11",
              others: "Backlit keyboard"
            },

            product_images: [
              { id: 1, product_image: "https://via.placeholder.com/300?text=Laptop1" },
              { id: 2, product_image: "https://via.placeholder.com/300?text=Laptop2" }
            ],

            get_image_count: "2",
            get_discounted_price: "900",
            stock: "25"
          }
        ],

        business_product: {
          minimum_bulk_quantity: 10,
          business_discount: 5
        },

        age_restriction: false,
        get_rating_info: "4.6",
        handpicked: true,
        free_delivery: true,
        best_seller: true,

        slug: "sample-laptop",
        tag: { product_tag: "electronics" },
        has_cashback: true,

        excitingdeal_start_date: "2025-11-20T01:39:25.312Z",
        excitingdeal_end_date: "2025-11-25T01:39:25.312Z"
      }
    ]
  };
};



// GET /api/v1/products/exciting-deals/?page=1 --axios version
// export const getExcitingDeals = async (page = 1) => {
//   try {
//     const response = await API.get(`/v1/products/exciting-deals/`, {
//       params: { page } // ?page=1
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching exciting deals:", error);
//     throw error;
//   }
// };
