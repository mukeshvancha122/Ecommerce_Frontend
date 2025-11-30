import React, { useState, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";

// Use the dedicated search services instead of calling axios directly.
import { searchProducts } from "../../../api/products/searchProduct/SearchProductService";
import { searchProductsByImage } from "../../../api/products/searchProduct/ImageSearchService";
import { addRecentSearch } from "../../../utils/recentSearches";

import SearchCategoryDropdown from "./SearchCategoryDropDown";
import SearchSuggestions from "./SearchSuggestions";
import "./SearchBar.css";

function SearchBar() {
  const history = useHistory();

  // state
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const [imageInputKey, setImageInputKey] = useState(Date.now());
  const [error, setError] = useState("");

  // refs
  const fileInputRef = useRef(null);
  const searchBarRef = useRef(null);

  // ---- helpers ----

  // Text search -> backend
  const handleSearch = async (searchQuery = null) => {
    const finalQuery = searchQuery || query.trim();
    if (!finalQuery || loading) return;

    try {
      setLoading(true);
      setError("");
      setShowSuggestions(false);

      // Save to recent searches
      addRecentSearch(finalQuery);

      // Call the intelligent search service
      const response = await searchProducts({
        product_name: finalQuery,
        category: category === "all" ? undefined : category,
        page: 1,
        page_size: 20,
        useIntelligentSearch: true, // Enable intelligent search
      });

      const results = response?.results || [];
      const total = response?.count ?? results.length;
      const searchStrategy = response?.searchStrategy;

      history.push("/search", {
        mode: "text",
        query: finalQuery,
        category,
        results,
        total,
        searchStrategy, // Pass search strategy for displaying related products message
      });
    } catch (err) {
      console.error("Text search error:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Search failed. Please try again.";
      setError(errorMessage);
      
      // Still navigate to search page with empty results so user can see the error
      history.push("/search", {
        mode: "text",
        query: finalQuery,
        category,
        results: [],
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // Enter key in the text input triggers search
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setIsFocused(false);
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  // Handle input blur (with delay to allow clicks on suggestions)
  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (selectedQuery) => {
    setQuery(selectedQuery);
    handleSearch(selectedQuery);
  };

  // Trigger hidden file input on camera click
  const handleImageSearchClick = () => {
    if (loading) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Image search -> backend
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || loading) return;

    try {
      setLoading(true);
      setError("");

      // Use image search service so the app works even without a live backend.
      const response = await searchProductsByImage({
        image: file,
        page: 1,
        page_size: 20,
      });

      const results = response?.results || [];
      const total = response?.count ?? results.length;

      history.push("/search", {
        mode: "image",
        previewImageUrl: URL.createObjectURL(file),
        results,
        total,
      });
    } catch (err) {
      console.error("Image search error:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Image search failed. Please try again.";
      setError(errorMessage);
      
      // Still navigate to search page with empty results so user can see the error
      history.push("/search", {
        mode: "image",
        previewImageUrl: URL.createObjectURL(file),
        results: [],
        total: 0,
      });
    } finally {
      setLoading(false);
      // re-allow same file upload twice in a row
      setImageInputKey(Date.now());
    }
  };

  return (
    <div className="searchBarWrapper" ref={searchBarRef}>
      <div className={`searchBarOuter ${loading ? "isLoading" : ""} ${showSuggestions ? "hasSuggestions" : ""}`}>
        {/* CATEGORY DROPDOWN (moved out to its own component) */}
        <SearchCategoryDropdown
          value={category}
          onChange={setCategory}
          disabled={loading}
        />

        {/* TEXT INPUT */}
        <input
          id="search-query"
          name="searchQuery"
          className="searchBarInput"
          type="text"
          placeholder="Search products, brands and more…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={loading}
        />

        {/* IMAGE SEARCH BUTTON */}
        <div
          className="searchBarImageBtn"
          onClick={handleImageSearchClick}
          role="button"
          tabIndex={0}
          title="Search by image"
          aria-label="Search by image"
        >
          <input
            id="searchImageUpload"
            name="searchImageUpload"
            key={imageInputKey}
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageFileChange}
            disabled={loading}
          />
          <span
            className="searchBarCameraIcon"
            role="img"
            aria-hidden="false"
            aria-label="camera"
          >
            📷
          </span>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          className="searchBarSubmit"
          onClick={handleSearch}
          disabled={loading}
          aria-label="Search"
        >
          {loading ? (
            <span className="searchBarMagnifier">…</span>
          ) : (
            <span
              className="searchBarMagnifier"
              role="img"
              aria-hidden="false"
              aria-label="search"
            >
              🔍
            </span>
          )}
        </button>
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <SearchSuggestions
          query={query}
          isOpen={showSuggestions && isFocused}
          onSelect={handleSuggestionSelect}
          onClose={() => setShowSuggestions(false)}
          category={category}
        />
      )}

      {/* error line */}
      {error && <div className="searchBarError">{error}</div>}
    </div>
  );
}

export default SearchBar;
