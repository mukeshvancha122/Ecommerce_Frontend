import React, { useState, useRef, useEffect, useCallback } from "react";
import Dropdown from "./DropDown";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion" },
  { value: "home", label: "Home & Kitchen" },
  { value: "beauty", label: "Beauty" },
  { value: "grocery", label: "Grocery" },
];

function SearchCategoryDropdown(props) {
  return (
    <Dropdown
      {...props}
      options={CATEGORIES}
    />
  );
}

export default SearchCategoryDropdown;