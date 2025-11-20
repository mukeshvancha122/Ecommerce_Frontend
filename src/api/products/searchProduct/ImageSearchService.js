// imageSearchService.js (dummy - API import kept for parity if you wire backend)
import API from "../../../axios";

export const searchProductsByImage = async ({ image, page = 1, page_size = 10 }) => {
  console.log("Dummy image search:", { image, page, page_size });

  return {
    count: 123,
    next: "http://api.example.org/accounts/?page=4",
    previous: "http://api.example.org/accounts/?page=2",
    results: [
      {
        id: 1,
        product_name: "Image Matched Sneaker",
        product_description: "Sneaker found using visual search.",
        product_discount: 20,
        product_category: {
          id: 10,
          category_name: "Shoes",
          category_image: "https://via.placeholder.com/300x200?text=Shoes",
          slug: "shoes",
          is_discount_active: true,
          discount_start_date: "2025-11-20T02:01:54.555Z",
          discount_end_date: "2025-12-05T02:01:54.555Z",
        },
        sub_category: {
          id: 3,
          sub_category_name: "Sneakers",
          sub_category_discount: 10,
          discount_start_date: "2025-11-20T02:01:54.555Z",
          discount_end_date: "2025-12-10T02:01:54.555Z",
          sub_category_image: "https://via.placeholder.com/200x150?text=Sneakers",
          is_discount_active: true,
          slug: "sneakers",
        },
        is_top_selling: true,
        weekly_drop: true,
        exciting_deals: "Image Search Offer",
        featured_product: true,
        faq: "Found using image similarity.",
        brand: {
          brand_name: "Nike",
          brand_image: "https://via.placeholder.com/150?text=Nike",
          slug: "nike",
        },
        product_variations: [
          {
            id: 101,
            product: {
              id: 1,
              product_name: "Image Matched Sneaker",
              product_description: "Comfort + style.",
              brand: 1,
            },
            product_color: "White/Red",
            product_size: "9",
            product_price: 150,
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
              { id: 1, product_image: "https://via.placeholder.com/300?text=Sneaker1" },
            ],
            get_image_count: "1",
            get_discounted_price: "120",
            stock: "12",
          },
        ],
        business_product: {
          minimum_bulk_quantity: 10,
          business_discount: 5,
        },
        age_restriction: false,
        get_rating_info: "4.6",
        handpicked: true,
        free_delivery: true,
        best_seller: true,
        slug: "image-matched-sneaker",
        tag: {
          product_tag: "image-search",
        },
        has_cashback: true,
        excitingdeal_start_date: "2025-11-20T02:01:54.555Z",
        excitingdeal_end_date: "2025-11-30T02:01:54.555Z",
      },
    ],
  };
};




// /**
//  * Search products by image.
//  * @param {Object} options
//  * @param {File|string} options.image  - File object (from input) OR image URL string.
//  * @param {number} [options.page=1]
//  * @param {number} [options.page_size=10]
//  */
// export const searchProductsByImage = async ({ image, page = 1, page_size = 10 }) => {
//   const formData = new FormData();

//   // If it's a File, send it directly. If it's a string, still append as field.
//   formData.append("image", image);

//   try {
//     const response = await API.post("/v1/products/search/image/", formData, {
//       params: { page, page_size },
//       headers: {
//         "Content-Type": "multipart/form-data",
//         // If your backend really needs this and you have the token:
//         // "X-CSRFTOKEN": yourToken,
//       },
//     });

//     return response.data; // {count, next, previous, results: [...]}
//   } catch (error) {
//     console.error("Error searching products by image:", error);
//     throw error;
//   }
// };