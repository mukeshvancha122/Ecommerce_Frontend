import React, { useState, useEffect, useRef } from "react";
import "./SearchSuggestions.css";
import { getRecentSearches, removeRecentSearch, clearRecentSearches } from "../../../utils/recentSearches";

// Popular/trending searches (can be fetched from backend later)
const POPULAR_SEARCHES = [
  "smartphones",
  "laptops",
  "shoes",
  "dresses",
  "headphones",
  "watches",
  "bags",
  "cameras",
];

function SearchSuggestions({
  query = "",
  isOpen = false,
  onSelect,
  onClose,
  category = "all",
}) {
  const [recentSearches, setRecentSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const wrapperRef = useRef(null);

  // Load recent searches
  useEffect(() => {
    if (isOpen) {
      const recent = getRecentSearches();
      setRecentSearches(recent);
    }
  }, [isOpen]);

  // Generate suggestions based on query
  useEffect(() => {
    if (!isOpen) {
      setSuggestions([]);
      setFocusedIndex(-1);
      return;
    }

    const normalizedQuery = query.toLowerCase().trim();

    if (normalizedQuery.length === 0) {
      // Show recent searches and popular searches when no query
      setSuggestions([]);
      return;
    }

    // Filter popular searches that match query
    const matchingPopular = POPULAR_SEARCHES.filter((search) =>
      search.toLowerCase().includes(normalizedQuery)
    );

    // Filter recent searches that match query
    const matchingRecent = recentSearches.filter((search) =>
      search.toLowerCase().includes(normalizedQuery) &&
      !matchingPopular.includes(search.toLowerCase())
    );

    // Combine: matching recent first, then matching popular
    const combined = [...matchingRecent, ...matchingPopular].slice(0, 8);
    setSuggestions(combined);
    setFocusedIndex(-1);
  }, [query, isOpen, recentSearches]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (isOpen && wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        onClose?.();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle suggestion selection
  const handleSelect = (selectedQuery) => {
    onSelect?.(selectedQuery);
    onClose?.();
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      const allItems = query.trim() ? suggestions : recentSearches.slice(0, 8);
      const hasItems = allItems.length > 0;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (hasItems) {
          setFocusedIndex((prev) => (prev + 1 >= allItems.length ? 0 : prev + 1));
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (hasItems) {
          setFocusedIndex((prev) => (prev - 1 < 0 ? allItems.length - 1 : prev - 1));
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (hasItems && focusedIndex >= 0 && focusedIndex < allItems.length) {
          handleSelect(allItems[focusedIndex]);
        }
      } else if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, focusedIndex, suggestions, recentSearches, query, handleSelect, onClose]);

  const handleRemoveRecent = (e, searchQuery) => {
    e.stopPropagation();
    removeRecentSearch(searchQuery);
    setRecentSearches(getRecentSearches());
  };

  const handleClearRecent = (e) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecentSearches([]);
  };

  if (!isOpen) return null;

  const hasQuery = query.trim().length > 0;
  const showRecent = !hasQuery && recentSearches.length > 0;
  const showSuggestions = hasQuery && suggestions.length > 0;
  const showPopular = !hasQuery && recentSearches.length === 0;
  const allItems = hasQuery ? suggestions : (showRecent ? recentSearches : POPULAR_SEARCHES).slice(0, 8);

  if (!showRecent && !showSuggestions && !showPopular) {
    return null;
  }

  return (
    <div className="searchSuggestions" ref={wrapperRef}>
      <div className="searchSuggestionsContent">
        {showRecent && (
          <>
            <div className="searchSuggestionsHeader">
              <span className="searchSuggestionsTitle">Recent searches</span>
              <button
                type="button"
                className="searchSuggestionsClear"
                onClick={handleClearRecent}
                aria-label="Clear recent searches"
              >
                Clear
              </button>
            </div>
            <ul className="searchSuggestionsList" role="listbox">
              {recentSearches.slice(0, 8).map((search, idx) => (
                <li
                  key={`recent-${idx}`}
                  role="option"
                  aria-selected={focusedIndex === idx}
                  className={`searchSuggestionsItem ${
                    focusedIndex === idx ? "focused" : ""
                  } ${idx < recentSearches.length - 1 ? "hasDivider" : ""}`}
                  onClick={() => handleSelect(search)}
                >
                  <span className="searchSuggestionsIcon">🕐</span>
                  <span className="searchSuggestionsText">{search}</span>
                  <button
                    type="button"
                    className="searchSuggestionsRemove"
                    onClick={(e) => handleRemoveRecent(e, search)}
                    aria-label={`Remove ${search} from recent searches`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {showSuggestions && (
          <>
            <div className="searchSuggestionsHeader">
              <span className="searchSuggestionsTitle">Suggestions</span>
            </div>
            <ul className="searchSuggestionsList" role="listbox">
              {suggestions.map((suggestion, idx) => (
                <li
                  key={`suggestion-${idx}`}
                  role="option"
                  aria-selected={focusedIndex === idx}
                  className={`searchSuggestionsItem ${
                    focusedIndex === idx ? "focused" : ""
                  } ${idx < suggestions.length - 1 ? "hasDivider" : ""}`}
                  onClick={() => handleSelect(suggestion)}
                >
                  <span className="searchSuggestionsIcon">🔍</span>
                  <span className="searchSuggestionsText">
                    {suggestion.split(new RegExp(`(${query})`, "gi")).map((part, i) =>
                      part.toLowerCase() === query.toLowerCase() ? (
                        <strong key={i}>{part}</strong>
                      ) : (
                        part
                      )
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        {showPopular && (
          <>
            <div className="searchSuggestionsHeader">
              <span className="searchSuggestionsTitle">Popular searches</span>
            </div>
            <ul className="searchSuggestionsList" role="listbox">
              {POPULAR_SEARCHES.slice(0, 8).map((search, idx) => (
                <li
                  key={`popular-${idx}`}
                  role="option"
                  aria-selected={focusedIndex === idx}
                  className={`searchSuggestionsItem ${
                    focusedIndex === idx ? "focused" : ""
                  }`}
                  onClick={() => handleSelect(search)}
                >
                  <span className="searchSuggestionsText">{search}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default SearchSuggestions;

