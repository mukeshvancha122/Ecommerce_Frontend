import React, { useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import API from "../../../axios";
import SearchCategoryDropdown from "./SearchCategoryDropDown";
import "./SearchBar.css";

function SearchBar() {
  const history = useHistory();

  // state
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [imageInputKey, setImageInputKey] = useState(Date.now());
  const [error, setError] = useState("");

  // refs
  const fileInputRef = useRef(null);

  // ---- helpers ----

  // Text search -> backend
  const handleSearch = async () => {
    if (!query.trim() || loading) return;

    try {
      setLoading(true);
      setError("");

      // Try the search endpoint - adjust endpoint based on your backend
      const res = await API.get("/v1/products/search-product-view/", {
        params: {
          product_name: query.trim(),
          category: category === "all" ? null : category,
          page: 1,
          page_size: 20,
        },
      });

      // Handle different response structures
      const responseData = res?.data?.data || res?.data || {};
      const results = responseData.results || [];
      const total = responseData.count || results.length;

      history.push("/search", {
        mode: "text",
        query: query.trim(),
        category,
        results,
        total,
      });
    } catch (err) {
      console.error("Text search error:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Search failed. Please try again.";
      setError(errorMessage);
      
      // Still navigate to search page with empty results so user can see the error
      history.push("/search", {
        mode: "text",
        query: query.trim(),
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
    }
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

      const formData = new FormData();
      formData.append("image", file);

      // Try the image search endpoint - adjust endpoint based on your backend
      const res = await API.post("/v1/products/search/image/", formData, {
        params: { page: 1, page_size: 20 },
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Handle different response structures
      const responseData = res?.data?.data || res?.data || {};
      const results = responseData.results || [];
      const total = responseData.count || results.length;

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
    <div className="searchBarWrapper">
      <div className={`searchBarOuter ${loading ? "isLoading" : ""}`}>
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
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
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

      {/* error line */}
      {error && <div className="searchBarError">{error}</div>}
    </div>
  );
}

export default SearchBar;
