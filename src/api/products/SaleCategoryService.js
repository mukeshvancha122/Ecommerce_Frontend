import API from "../../axios";

export const getSaleCategories = async () => {
  return [
    {
      id: 1,
      category_name: "Electronics",
      category_image: "https://via.placeholder.com/300x200?text=Electronics+Sale",
      slug: "electronics-sale",
      is_discount_active: true,
      discount_start_date: "2025-11-20T01:53:07.465Z",
      discount_end_date: "2025-12-05T01:53:07.465Z",
      description: "Big discounts on mobile phones, laptops, and gadgets."
    },
    {
      id: 2,
      category_name: "Fashion",
      category_image: "https://via.placeholder.com/300x200?text=Fashion+Sale",
      slug: "fashion-sale",
      is_discount_active: true,
      discount_start_date: "2025-11-21T01:53:07.465Z",
      discount_end_date: "2025-12-10T01:53:07.465Z",
      description: "Up to 60% off on men's and women's clothing."
    },
    {
      id: 3,
      category_name: "Footwear",
      category_image: "https://via.placeholder.com/300x200?text=Footwear+Sale",
      slug: "footwear-sale",
      is_discount_active: false,
      discount_start_date: "2025-11-20T01:53:07.465Z",
      discount_end_date: "2025-12-01T01:53:07.465Z",
      description: "Shoes and sandals at budget prices."
    },
    {
      id: 4,
      category_name: "Electronics",
      category_image: "https://via.placeholder.com/300x200?text=Home+Sale",
      slug: "home-appliances-sale",
      is_discount_active: true,
      discount_start_date: "2025-11-19T01:53:07.465Z",
      discount_end_date: "2025-12-15T01:53:07.465Z",
      description: "Kitchen & home essentials under massive discounts."
    },
    {
      id: 5,
      category_name: "Home Appliances",
      category_image: "https://via.placeholder.com/300x200?text=Home+Sale",
      slug: "home-appliances-sale",
      is_discount_active: true,
      discount_start_date: "2025-11-19T01:53:07.465Z",
      discount_end_date: "2025-12-15T01:53:07.465Z",
      description: "Kitchen & home essentials under massive discounts."
    },
    {
      id: 6,
      category_name: "Sports & Fitness",
      category_image: "https://via.placeholder.com/300x200?text=Home+Sale",
      slug: "home-appliances-sale",
      is_discount_active: true,
      discount_start_date: "2025-11-19T01:53:07.465Z",
      discount_end_date: "2025-12-15T01:53:07.465Z",
      description: "Kitchen & home essentials under massive discounts."
    },
    {
      id: 7,
      category_name: "Furniture",
      category_image: "https://via.placeholder.com/300x200?text=Home+Sale",
      slug: "home-appliances-sale",
      is_discount_active: true,
      discount_start_date: "2025-11-19T01:53:07.465Z",
      discount_end_date: "2025-12-15T01:53:07.465Z",
      description: "Kitchen & home essentials under massive discounts."
    },
    {
      id: 7,
      category_name: "Medicines",
      category_image: "https://via.placeholder.com/300x200?text=Home+Sale",
      slug: "home-appliances-sale",
      is_discount_active: true,
      discount_start_date: "2025-11-19T01:53:07.465Z",
      discount_end_date: "2025-12-15T01:53:07.465Z",
      description: "Kitchen & home essentials under massive discounts."
    }
  ];
};



// GET: /api/v1/products/sale-category-view/
// export const getSaleCategories = async () => {
//   try {
//     const response = await API.get("/v1/products/sale-category-view/");
//     return response.data; // returns array
//   } catch (error) {
//     console.error("Error fetching sale categories:", error);
//     throw error;
//   }
// };