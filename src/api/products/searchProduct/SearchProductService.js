export const searchProducts = async (filters = {}) => {
  console.log("Dummy product search filters:", filters);

  return {
    count: 123,
    next: "http://api.example.org/accounts/?page=4",
    previous: "http://api.example.org/accounts/?page=2",

    results: [
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
            product: {
              id: 1,
              product_name: "Nike Air Jordan",
              product_description: "High performance sports shoes.",
              brand: 1
            },

            product_color: "Black & Red",
            product_size: "10",
            product_price: 250,

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
              { id: 1, product_image: "https://via.placeholder.com/250?text=Jordan1" },
              { id: 2, product_image: "https://via.placeholder.com/250?text=Jordan2" }
            ],

            get_image_count: "2",
            get_discounted_price: "199",
            stock: "24"
          }
        ],

        business_product: {
          minimum_bulk_quantity: 10,
          business_discount: 8
        },

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