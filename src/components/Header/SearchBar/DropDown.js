import { useState, useRef, useEffect, useCallback } from "react";

function Dropdown({ value, onChange, disabled, options, className = "" }) {
  const [open, setOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const wrapperRef = useRef(null);

  const currentLabel =
    options.find((c) => c.value === value)?.label || options[0]?.label || "";

  const toggleOpen = () => {
    if (disabled || options.length === 0) return;
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        const curIdx = options.findIndex((c) => c.value === value);
        setFocusedIdx(curIdx === -1 ? 0 : curIdx);
      } else {
        setFocusedIdx(-1);
      }
      return next;
    });
  };

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setFocusedIdx(-1);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (open && wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [open, closeDropdown]);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") closeDropdown();
    }
    if (open) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, closeDropdown]);

  const handleKeyDown = (e) => {
    if (!open || options.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIdx((prev) =>
        prev + 1 >= options.length ? 0 : prev + 1
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIdx((prev) =>
        prev - 1 < 0 ? options.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIdx >= 0 && focusedIdx < options.length) {
        const picked = options[focusedIdx].value;
        onChange(picked);
        closeDropdown();
      }
    }
  };

  const handleSelect = (val) => {
    if (disabled) return;
    onChange(val);
    closeDropdown();
  };

  return (
    <div
      className={`searchBarCategory ${open ? "open" : ""} ${
        disabled ? "isDisabled" : ""
      } ${className}`}
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
          {options.map((opt, idx) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              className={[
                "searchBarCategoryMenuItem",
                value === opt.value ? "active" : "",
                idx === focusedIdx ? "focused" : "",
              ]
                .join(" ")
                .trim()}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(opt.value);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dropdown;
