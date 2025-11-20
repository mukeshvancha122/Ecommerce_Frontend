import React from "react";
import DropDown from "./DropDown";

const SUBS = {
  electronics: [
    { value: "all", label: "All" },
    { value: "smartphones", label: "Smartphones" },
    { value: "laptops", label: "Laptops" },
    { value: "headphones", label: "Headphones" },
  ],
  fashion: [
    { value: "all", label: "All" },
    { value: "mens-casual-shirts", label: "Casual Shirts" },
    { value: "mens-formal-shoes", label: "Formal Shoes" },
  ],
  home: [
    { value: "all", label: "All" },
    { value: "cookware", label: "Cookware" },
    { value: "kitchen-appliances", label: "Appliances" },
  ],
  beauty: [
    { value: "all", label: "All" },
  ],
  grocery: [
    { value: "all", label: "All" },
  ],
};

export default function SearchSubCategoryDropdown({ category, value, onChange, disabled }) {
  const options = SUBS[category] || [{ value: "all", label: "All" }];
  // Hide subcategory dropdown if only "All"
  if (!options || options.length <= 1) {
    return (
      <div style={{ display: "none" }} aria-hidden="true" />
    );
  }
  return (
    <DropDown
      value={value}
      onChange={onChange}
      disabled={disabled}
      options={options}
      className="searchBarSubCategory"
    />
  );
}


