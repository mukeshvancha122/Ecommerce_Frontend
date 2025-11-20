import API from "../../axios";

export const getSaleCategorySubcategory = async () => {
  return [
    {
      id: 1,
      sub_category: "Smartphones",
      category_name: "Electronics",
      category_discount: 25,
      discount_start_date: "2025-11-20T01:51:29.356Z",
      discount_end_date: "2025-12-05T01:51:29.356Z",
      slug: "electronics-smartphones-sale",
      is_discount_active: true
    },
    {
      id: 2,
      sub_category: "Laptops",
      category_name: "Electronics",
      category_discount: 18,
      discount_start_date: "2025-11-21T01:51:29.356Z",
      discount_end_date: "2025-12-10T01:51:29.356Z",
      slug: "electronics-laptops-sale",
      is_discount_active: true
    },
    {
      id: 3,
      sub_category: "Men's Jackets",
      category_name: "Fashion",
      category_discount: 40,
      discount_start_date: "2025-11-25T01:51:29.356Z",
      discount_end_date: "2025-12-20T01:51:29.356Z",
      slug: "mens-jackets-sale",
      is_discount_active: false
    },
    {
      id: 4,
      sub_category: "Shoes",
      category_name: "Footwear",
      category_discount: 35,
      discount_start_date: "2025-11-22T01:51:29.356Z",
      discount_end_date: "2025-12-05T01:51:29.356Z",
      slug: "footwear-shoes-sale",
      is_discount_active: true
    }
  ];
};

// export const getSaleCategorySubcategory = async () => {
//   try {
//     const response = await API.get("/v1/products/sale-category-subcategory-view/");
//     return response.data; // array
//   } catch (error) {
//     console.error("Error fetching sale category-subcategory data:", error);
//     throw error;
//   }
// };
