import React, { useState, useRef, useEffect, useCallback } from "react";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion" },
  { value: "home", label: "Home & Kitchen" },
  { value: "beauty", label: "Beauty" },
  { value: "grocery", label: "Grocery" },
];

function SearchCategoryDropdown({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);

  const wrapperRef = useRef(null);

  // get label for current value
  const currentLabel =
    CATEGORIES.find((c) => c.value === value)?.label || "All";

  // open/close dropdown
  const toggleOpen = () => {
    if (disabled) return;
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        // when opening, focus currently selected option
        const curIdx = CATEGORIES.findIndex((c) => c.value === value);
        setFocusedIdx(curIdx === -1 ? 0 : curIdx);
      } else {
        setFocusedIdx(-1);
      }
      return next;
    });
  };

  // close dropdown helper
  const closeDropdown = useCallback(() => {
    setOpen(false);
    setFocusedIdx(-1);
  }, []);

  // handle outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        open &&
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target)
      ) {
        closeDropdown();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, closeDropdown]);

  // handle Escape while open
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") {
        closeDropdown();
      }
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, closeDropdown]);

  // keyboard navigation inside dropdown
  const handleKeyDown = (e) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIdx((prev) => (prev + 1 >= CATEGORIES.length ? 0 : prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIdx((prev) =>
        prev - 1 < 0 ? CATEGORIES.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIdx >= 0 && focusedIdx < CATEGORIES.length) {
        const picked = CATEGORIES[focusedIdx].value;
        onChange(picked);
        closeDropdown();
      }
    }
  };

  // when clicking an option
  const handleSelect = (catVal) => {
    if (disabled) return;
    onChange(catVal);
    closeDropdown();
  };

  return (
    <div
      className={`searchBarCategory ${open ? "open" : ""} ${
        disabled ? "isDisabled" : ""
      }`}
      ref={wrapperRef}
      onClick={toggleOpen}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-haspopup="listbox"
      aria-expanded={open}
    >
      <span className="searchBarCategoryText">{currentLabel}</span>
      <span className="searchBarCategoryCaret">▾</span>

      {open && (
        <ul className="searchBarCategoryMenu" role="listbox">
          {CATEGORIES.map((cat, idx) => (
            <li
              key={cat.value}
              role="option"
              aria-selected={value === cat.value}
              className={[
                "searchBarCategoryMenuItem",
                value === cat.value ? "active" : "",
                idx === focusedIdx ? "focused" : "",
              ]
                .join(" ")
                .trim()}
              onClick={(e) => {
                e.stopPropagation(); // don't re-toggle parent click
                handleSelect(cat.value);
              }}
            >
              {cat.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchCategoryDropdown;
