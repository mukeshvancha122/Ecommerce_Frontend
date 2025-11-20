// src/components/Header/SearchBar/SearchBar.js
import React, { useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import "./SearchBar.css";

// 🔁 adjust these import paths to match your project
import { searchProducts } from "../../../api/products/searchProduct/SearchProductService";
import { searchProductsByImage } from "../../../api/products/searchProduct/ImageSearchService";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion" },
  { value: "home", label: "Home & Kitchen" },
  { value: "beauty", label: "Beauty" },
  { value: "grocery", label: "Grocery" },
];

function SearchBar() {
  const history = useHistory();

  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  // ---------- TEXT SEARCH ----------
  const handleSearch = async () => {
    if (!query.trim() || loading) return;

    try {
      setLoading(true);
      setError("");

      const filters = {
        products: query.trim(),
        category: category === "all" ? undefined : category,
        page: 1,
        page_size: 20,
      };

      const data = await searchProducts(filters);
      const results = data?.results || [];
      const count = data?.count ?? results.length;

      history.push("/search-results", {
        mode: "text",
        query: query.trim(),
        category,
        results,
        totalCount: count,
      });
    } catch (err) {
      console.error("Text search error:", err);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTextKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // ---------- IMAGE SEARCH ----------
  const handleImageButtonClick = () => {
    if (loading) return;
    fileInputRef.current?.click();
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || loading) return;

    try {
      setLoading(true);
      setError("");

      const data = await searchProductsByImage({
        image: file,
        page: 1,
        page_size: 20,
      });

      const results = data?.results || [];
      const count = data?.count ?? results.length;

      history.push("/search-results", {
        mode: "image",
        previewImageUrl: URL.createObjectURL(file),
        results,
        totalCount: count,
      });
    } catch (err) {
      console.error("Image search error:", err);
      setError("Image search failed. Please try again.");
    } finally {
      setLoading(false);
      // allow selecting the same file again if needed
      e.target.value = "";
    }
  };

  return (
    <div className="searchBar-container">
      <div className={`searchBar ${loading ? "searchBar--loading" : ""}`}>
        {/* Category select */}
        <div className="searchBar-categoryWrapper">
          <select
            className="searchBar-categorySelect"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
            aria-label="Select category"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Text input */}
        <input
          className="searchBar-input"
          type="text"
          placeholder="Search products, brands and more…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleTextKeyDown}
          disabled={loading}
        />

        {/* Image search (camera) */}
        <button
          type="button"
          className="searchBar-iconBtn searchBar-iconBtn--camera"
          onClick={handleImageButtonClick}
          disabled={loading}
          aria-label="Search by image"
        >
          <span role="img" aria-hidden="true">
            📷
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
            style={{ display: "none" }}
          />
        </button>

        {/* Search submit */}
        <button
          type="button"
          className="searchBar-iconBtn searchBar-iconBtn--submit"
          onClick={handleSearch}
          disabled={loading}
          aria-label="Search"
        >
          {loading ? (
            <span className="searchBar-spinner" />
          ) : (
            <span role="img" aria-hidden="true">
              🔍
            </span>
          )}
        </button>
      </div>

      {error && <div className="searchBar-error">{error}</div>}
    </div>
  );
}

export default SearchBar;
