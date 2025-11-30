import React, { useState, useEffect } from "react";
import Dropdown from "./DropDown";
import { getAllCategories } from "../../../api/products/CategoryService";

function SearchCategoryDropdown(props) {
  const [categories, setCategories] = useState([
    { value: "all", label: "All" }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchCategories = async () => {
      try {
        const cats = await getAllCategories();
        if (!isMounted) return;
        
        // Transform backend categories to dropdown format
        const categoryOptions = [
          { value: "all", label: "All" },
          ...(Array.isArray(cats) ? cats : []).map((cat) => ({
            value: cat.slug || cat.category_name?.toLowerCase() || String(cat.id),
            label: cat.category_name || cat.name || `Category ${cat.id}`,
          })),
        ];
        
        setCategories(categoryOptions);
      } catch (error) {
        console.error("Error fetching categories for search dropdown:", error);
        // Keep default "All" option on error
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchCategories();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Dropdown
      {...props}
      options={categories}
      disabled={loading}
    />
  );
}

export default SearchCategoryDropdown;