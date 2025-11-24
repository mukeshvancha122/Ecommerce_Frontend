import React, { useState, useEffect } from "react";
import Dropdown from "./DropDown";
import { getAllCategories } from "../../../api/products/CategoryService";

function SearchCategoryDropdown(props) {
  const [categories, setCategories] = useState([{ value: "all", label: "All" }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getAllCategories();
        if (isMounted && Array.isArray(data)) {
          const categoryOptions = [
            { value: "all", label: "All" },
            ...data.map((cat) => {
              const categoryName = typeof cat.category_name === 'object' 
                ? cat.category_name.en || cat.category_name 
                : cat.category_name;
              return {
                value: cat.slug || cat.id,
                label: categoryName || `Category ${cat.id}`,
              };
            }),
          ];
          setCategories(categoryOptions);
        }
      } catch (error) {
        console.error("Error fetching categories for search:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <Dropdown
        {...props}
        options={[{ value: "all", label: "All" }]}
      />
    );
  }

  return (
    <Dropdown
      {...props}
      options={categories}
    />
  );
}

export default SearchCategoryDropdown;