import API from "../../axios";

export const getCategorySubcategories = async () => {
  return [
    {
      id: 1,
      sub_category: "Casual Shirts",
      category_name: "Men's Fashion",
      category_discount: 20,
      discount_start_date: "2025-11-20T01:25:25.233Z",
      discount_end_date: "2025-12-05T01:25:25.233Z",
      slug: "mens-casual-shirts",
      is_discount_active: true
    },
    {
      id: 2,
      sub_category: "Formal Shoes",
      category_name: "Men's Fashion",
      category_discount: 15,
      discount_start_date: "2025-11-25T01:25:25.233Z",
      discount_end_date: "2025-11-30T01:25:25.233Z",
      slug: "mens-formal-shoes",
      is_discount_active: false
    },
    {
      id: 3,
      sub_category: "Smartphones",
      category_name: "Electronics",
      category_discount: 10,
      discount_start_date: "2025-11-22T01:25:25.233Z",
      discount_end_date: "2025-12-10T01:25:25.233Z",
      slug: "electronics-smartphones",
      is_discount_active: true
    },
    {
      id: 4,
      sub_category: "Laptops",
      category_name: "Electronics",
      category_discount: 5,
      discount_start_date: null,
      discount_end_date: null,
      slug: "electronics-laptops",
      is_discount_active: false
    }
  ];
};

// GET: /api/v1/products/category-subcategory-view/ --axios
// export const getCategorySubcategories = async () => {
//   try {
//     const response = await API.get("/v1/products/category-subcategory-view/");
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching category-subcategory data:", error);
//     throw error;
//   }
// };


