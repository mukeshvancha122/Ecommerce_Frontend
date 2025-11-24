import React, { useState, useEffect } from "react";
import DropDown from "./DropDown";
import { getCategorySubcategories } from "../../../api/products/CategorySubCategoryService";

export default function SearchSubCategoryDropdown({ category, value, onChange, disabled }) {
  const [subcategories, setSubcategories] = useState([{ value: "all", label: "All" }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!category || category === "all") {
      setSubcategories([{ value: "all", label: "All" }]);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await getCategorySubcategories();
        if (isMounted && Array.isArray(data)) {
          // Filter subcategories by the selected category
          const filtered = data.filter((sub) => {
            const catSlug = sub.category_name?.slug || sub.category_name?.id || sub.category_name;
            const catName = typeof sub.category_name === 'object' 
              ? sub.category_name.en || sub.category_name 
              : sub.category_name;
            return catSlug === category || catName === category || sub.category === category;
          });

          const subcategoryOptions = [
            { value: "all", label: "All" },
            ...filtered.map((sub) => {
              const subName = typeof sub.sub_category === 'object' 
                ? sub.sub_category.en || sub.sub_category 
                : sub.sub_category;
              return {
                value: sub.slug || sub.id,
                label: subName || `Subcategory ${sub.id}`,
              };
            }),
          ];
          setSubcategories(subcategoryOptions);
        }
      } catch (error) {
        console.error("Error fetching subcategories for search:", error);
        setSubcategories([{ value: "all", label: "All" }]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();
    return () => { isMounted = false; };
  }, [category]);

  // Hide subcategory dropdown if only "All"
  if (loading || !subcategories || subcategories.length <= 1) {
    return (
      <div style={{ display: "none" }} aria-hidden="true" />
    );
  }

  return (
    <DropDown
      value={value}
      onChange={onChange}
      disabled={disabled}
      options={subcategories}
      className="searchBarSubCategory"
    />
  );
}


