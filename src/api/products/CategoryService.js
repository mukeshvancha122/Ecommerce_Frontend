import API from "../../axios";

export const getAllCategories = async () => {
  return [
    {
      id: 1,
      category_name: "Men's Fashion",
      category_image: "https://via.placeholder.com/300x200?text=Men+Fashion",
      slug: "mens-fashion",
      is_discount_active: true,
      discount_start_date: "2025-11-20T01:18:33.423Z",
      discount_end_date: "2025-12-20T01:18:33.423Z",
      description: "Latest trends in men's clothing, shoes and accessories."
    },
    {
      id: 2,
      category_name: "Women's Fashion",
      category_image: "https://via.placeholder.com/300x200?text=Women+Fashion",
      slug: "womens-fashion",
      is_discount_active: false,
      discount_start_date: null,
      discount_end_date: null,
      description: "Explore stylish outfits, dresses, shoes, and accessories."
    },
    {
      id: 3,
      category_name: "Electronics",
      category_image: "https://via.placeholder.com/300x200?text=Electronics",
      slug: "electronics",
      is_discount_active: true,
      discount_start_date: "2025-11-25T01:18:33.423Z",
      discount_end_date: "2025-11-30T01:18:33.423Z",
      description: "Mobiles, laptops, headphones, and latest gadgets."
    },
    {
      id: 4,
      category_name: "Home & Kitchen",
      category_image: "https://via.placeholder.com/300x200?text=Home+%26+Kitchen",
      slug: "home-kitchen",
      is_discount_active: false,
      discount_start_date: null,
      discount_end_date: null,
      description: "Home appliances, decor items, and kitchen essentials."
    },
    {
      id: 5,
      category_name: "Sports & Fitness",
      category_image: "https://via.placeholder.com/300x200?text=Sports+%26+Fitness",
      slug: "sports-fitness",
      is_discount_active: true,
      discount_start_date: "2025-11-10T01:18:33.423Z",
      discount_end_date: "2025-11-27T01:18:33.423Z",
      description: "Sportswear, gym equipment, and outdoor activity gear."
    }
  ];
};



// GET: /api/v1/products/category-view/ - axios version
// export const getAllCategories = async () => {
//   try {
//     const response = await API.get("/v1/products/category-view/");
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     throw error;
//   }
// };

