// src/components/Search/SearchSubCategoryDropdown.js
import React, { useMemo } from "react";
import Dropdown from "./DropDown";

// simple example – you can replace with real options from API
const SUBCATEGORY_MAP = {
  electronics: [
    { value: "mobiles", label: "Mobiles" },
    { value: "laptops", label: "Laptops" },
    { value: "audio", label: "Headphones & Audio" },
  ],
  fashion: [
    { value: "mens-clothing", label: "Men's clothing" },
    { value: "womens-clothing", label: "Women's clothing" },
    { value: "footwear", label: "Footwear" },
  ],
  home: [
    { value: "kitchen", label: "Kitchen" },
    { value: "decor", label: "Home Decor" },
  ],
  beauty: [
    { value: "makeup", label: "Makeup" },
    { value: "skincare", label: "Skincare" },
  ],
  grocery: [
    { value: "snacks", label: "Snacks" },
    { value: "beverages", label: "Beverages" },
  ],
};

function SearchSubCategoryDropdown({ category, value, onChange, disabled }) {
  const options = useMemo(() => {
    if (!category || category === "all") return [];
    const list = SUBCATEGORY_MAP[category] || [];
    return [{ value: "all", label: "All subcategories" }, ...list];
  }, [category]);

  // if no options, render nothing
  if (!category || category === "all" || options.length === 0) {
    return null;
  }

  return (
    <Dropdown
      value={value}
      onChange={onChange}
      disabled={disabled}
      options={options}
      className="subCategoryDropdown"
    />
  );
}

export default SearchSubCategoryDropdown;