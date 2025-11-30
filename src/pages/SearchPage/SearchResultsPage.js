import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import "./SearchResultsPage.css";
import { formatCurrency } from "../../utils/currency";
import { getImageUrl } from "../../utils/imageUtils";

const PRICE_FILTERS = [
  { id: "under-1000", label: "Under ₹1,000", test: (price) => price != null && price < 1000 },
  { id: "1000-5000", label: "₹1,000 – ₹5,000", test: (price) => price != null && price >= 1000 && price <= 5000 },
  { id: "5000-10000", label: "₹5,000 – ₹10,000", test: (price) => price != null && price >= 5000 && price <= 10000 },
  { id: "10000-plus", label: "₹10,000 & above", test: (price) => price != null && price >= 10000 },
];

const RATING_FILTERS = [
  { id: "4", label: "4★ & up", value: 4 },
  { id: "3", label: "3★ & up", value: 3 },
  { id: "2", label: "2★ & up", value: 2 },
  { id: "1", label: "1★ & up", value: 1 },
];

const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "price-low-high", label: "Price: Low to High" },
  { id: "price-high-low", label: "Price: High to Low" },
  { id: "rating-high-low", label: "Avg. Customer Review" },
  { id: "newest", label: "Newest Arrivals" },
];

const getPrimaryVariation = (product) => product?.product_variations?.[0];

// Parse price value (handles objects with final_price, numbers, strings)
const parsePrice = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isNaN(value) ? null : value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof value === "object") {
    if ("final_price" in value) return parsePrice(value.final_price);
    if ("amount" in value) return parsePrice(value.amount);
    if ("price" in value) return parsePrice(value.price);
  }
  return null;
};

const getPriceValue = (product) => {
  const variation = getPrimaryVariation(product);
  const discounted = parsePrice(variation?.get_discounted_price);
  const regular = parsePrice(variation?.product_price);
  return discounted ?? regular ?? null;
};

const getFormattedPrice = (value) => {
  if (value === null || value === undefined) return "";
  return formatCurrency(value);
};

const getRatingValue = (product) => {
  const value = parseFloat(product?.get_rating_info);
  return Number.isFinite(value) ? value : null;
};

const buildDepartmentFacets = (items) => {
  const map = new Map();
  items.forEach((product) => {
    const label = product?.product_category?.category_name || "Other";
    const value = product?.product_category?.slug || label.toLowerCase();
    const key = value || label;
    if (!map.has(key)) {
      map.set(key, {
        label,
        value: key,
        count: 1,
      });
    } else {
      map.get(key).count += 1;
    }
  });
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
};

const getProductImage = (product) => {
  const image = product?.product_variations?.[0]?.product_images?.[0]?.product_image;
  return image ? getImageUrl(image) : "/images/NO_IMG.png";
};

const getStockValue = (product) => {
  const variation = getPrimaryVariation(product);
  const stock = parseInt(variation?.stock, 10);
  return Number.isFinite(stock) ? stock : 0;
};

const getProductIdentifier = (product, idx) =>
  product?.id ?? product?.slug ?? `idx-${idx}`;

const ProductCard = ({ product, onClick }) => {
  const variation = getPrimaryVariation(product);
  const discounted = parsePrice(variation?.get_discounted_price);
  const price = parsePrice(variation?.product_price);
  const rating = getRatingValue(product);
  const mainImage = getProductImage(product);

  return (
    <article className="resultsCard" onClick={() => onClick(product)}>
      <div className="resultsCard-media">
        <img src={mainImage} alt={product.product_name} />
        {product.best_seller && <span className="resultsCard-pill">Best seller</span>}
        {product.handpicked && <span className="resultsCard-pill resultsCard-pill--green">Our pick</span>}
      </div>

      <div className="resultsCard-body">
        <h3 className="resultsCard-title">{product.product_name}</h3>
        {product.brand?.brand_name && (
          <div className="resultsCard-brand">by {product.brand.brand_name}</div>
        )}

        {rating && (
          <div className="resultsCard-rating">
            <span className="resultsCard-ratingValue">{rating.toFixed(1)}</span>
            <span className="resultsCard-ratingStar">★</span>
            <span className="resultsCard-ratingMeta">
              {product.get_rating_info_count || "100+"} ratings
            </span>
          </div>
        )}

        <div className="resultsCard-priceRow">
          {Number.isFinite(discounted) ? (
            <>
              <span className="resultsCard-price">{getFormattedPrice(discounted)}</span>
              {Number.isFinite(price) && (
                <span className="resultsCard-oldPrice">{getFormattedPrice(price)}</span>
              )}
            </>
          ) : (
            Number.isFinite(price) && <span className="resultsCard-price">{getFormattedPrice(price)}</span>
          )}
        </div>

        <p className="resultsCard-description">
          {product.product_description || "No description available."}
        </p>

        <div className="resultsCard-delivery">
          {product.free_delivery ? "FREE delivery" : "Standard delivery"} • Ships in 2–4 days
        </div>

        <button
          type="button"
          className="resultsCard-btn"
          onClick={(e) => {
            e.stopPropagation();
            onClick(product);
          }}
        >
          View product
        </button>
      </div>
    </article>
  );
};

export const ProductResultsExperience = ({
  title = "Results",
  subtitle = "Check each product page for other buying options. Price and other details may vary based on product size and color.",
  query = "",
  mode = "text",
  items = [],
  total = 0,
  previewImageUrl,
  loading = false,
  error = "",
  onProductClick = () => {},
  history = null,
  searchStrategy = null,
}) => {
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState("");
  const [minRating, setMinRating] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [primeOnly, setPrimeOnly] = useState(false);
  const [sortKey, setSortKey] = useState("featured");

  const signature = useMemo(
    () => items.map((product, idx) => getProductIdentifier(product, idx)).join("|"),
    [items]
  );

  useEffect(() => {
    setSelectedDepartments([]);
    setSelectedPrice("");
    setMinRating(null);
    setInStockOnly(false);
    setPrimeOnly(false);
    setSortKey("featured");
  }, [signature]);

  const departmentFacets = useMemo(() => buildDepartmentFacets(items), [items]);

  const filteredItems = useMemo(() => {
    return items.filter((product) => {
      const departmentValue =
        product?.product_category?.slug ||
        product?.product_category?.category_name?.toLowerCase();

      if (selectedDepartments.length && !selectedDepartments.includes(departmentValue)) {
        return false;
      }

      const price = getPriceValue(product);
      if (selectedPrice) {
        const priceFilter = PRICE_FILTERS.find((p) => p.id === selectedPrice);
        if (priceFilter && !priceFilter.test(price)) {
          return false;
        }
      }

      if (minRating != null) {
        const rating = getRatingValue(product);
        if (!(Number.isFinite(rating) && rating >= minRating)) {
          return false;
        }
      }

      if (inStockOnly && getStockValue(product) <= 0) {
        return false;
      }

      if (primeOnly && !product.free_delivery) {
        return false;
      }

      return true;
    });
  }, [items, selectedDepartments, selectedPrice, minRating, inStockOnly, primeOnly]);

  const sortedItems = useMemo(() => {
    const arr = [...filteredItems];
    const comparePrice = (a, b) => {
      const priceA = getPriceValue(a) ?? Number.MAX_VALUE;
      const priceB = getPriceValue(b) ?? Number.MAX_VALUE;
      return priceA - priceB;
    };

    switch (sortKey) {
      case "price-low-high":
        arr.sort(comparePrice);
        break;
      case "price-high-low":
        arr.sort((a, b) => comparePrice(b, a));
        break;
      case "rating-high-low":
        arr.sort((a, b) => (getRatingValue(b) || 0) - (getRatingValue(a) || 0));
        break;
      case "newest":
        arr.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
      default:
        break;
    }
    return arr;
  }, [filteredItems, sortKey]);

  const toggleDepartment = (value) => {
    setSelectedDepartments((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const clearFilters = () => {
    setSelectedDepartments([]);
    setSelectedPrice("");
    setMinRating(null);
    setInStockOnly(false);
    setPrimeOnly(false);
  };

  const emptyMessage =
    !loading && sortedItems.length === 0
      ? "No products match the selected filters. Try removing a filter or searching again."
      : "";

  return (
    <div className="searchResultsPage">
      {error && <div className="resultsBanner resultsBanner--error">{error}</div>}

      <div className="resultsLayout">
        <aside className="resultsFilters">
          <div className="resultsFilters-header">
            <h3>Filters</h3>
            <button type="button" className="resultsFilters-clear" onClick={clearFilters}>
              Clear all
            </button>
          </div>

          <div className="filterSection">
            <h4>Department</h4>
            <div className="filterList">
              {departmentFacets.length === 0 && <p className="filterEmpty">No departments</p>}
              {departmentFacets.map((facet) => (
                <label key={facet.value} className="filterOption">
                  <input
                    type="checkbox"
                    checked={selectedDepartments.includes(facet.value)}
                    onChange={() => toggleDepartment(facet.value)}
                  />
                  <span>
                    {facet.label} <em>({facet.count})</em>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="filterSection">
            <h4>Price</h4>
            <div className="filterList">
              {PRICE_FILTERS.map((option) => (
                <label key={option.id} className="filterOption">
                  <input
                    type="radio"
                    name="price-filter"
                    checked={selectedPrice === option.id}
                    onChange={() =>
                      setSelectedPrice((prev) => (prev === option.id ? "" : option.id))
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filterSection">
            <h4>Customer Reviews</h4>
            <div className="filterList">
              {RATING_FILTERS.map((option) => (
                <label key={option.id} className="filterOption">
                  <input
                    type="radio"
                    name="rating-filter"
                    checked={minRating === option.value}
                    onChange={() =>
                      setMinRating((prev) => (prev === option.value ? null : option.value))
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filterSection">
            <h4>Availability</h4>
            <label className="filterOption">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={() => setInStockOnly((prev) => !prev)}
              />
              <span>In stock only</span>
            </label>
          </div>

          <div className="filterSection">
            <h4>Fast Delivery</h4>
            <label className="filterOption">
              <input
                type="checkbox"
                checked={primeOnly}
                onChange={() => setPrimeOnly((prev) => !prev)}
              />
              <span>Prime eligible (Free delivery)</span>
            </label>
          </div>
        </aside>

        <section className="resultsContent">
          <header className="resultsContent-header">
            <div>
              <h1 className="searchResultsTitle">{title || "Results"}</h1>
              <p className="searchResultsSub">{subtitle}</p>
              <p className="searchResultsMeta">
                {mode === "image"
                  ? `Showing visually similar items • ${total || sortedItems.length} products`
                  : `Showing results for "${query || title || "your search"}"${
                      total || sortedItems.length ? ` • ${total || sortedItems.length} products` : ""
                    }`}
              </p>
              {searchStrategy && searchStrategy.searchType !== 'broad' && sortedItems.length > 0 && (
                <p className="searchResultsRelated" style={{ 
                  color: '#007185', 
                  fontSize: '14px', 
                  marginTop: '8px',
                  fontStyle: 'italic'
                }}>
                  {searchStrategy.searchType === 'keyword-category' 
                    ? `Showing related products in ${searchStrategy.primaryCategory || 'related categories'}`
                    : searchStrategy.searchType === 'category'
                    ? `Showing products in ${searchStrategy.primaryCategory || 'selected category'}`
                    : 'Showing related products'}
                </p>
              )}
            </div>

            <div className="resultsSort">
              <label htmlFor="results-sort">Sort by:</label>
              <select
                id="results-sort"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </header>

          {mode === "image" && previewImageUrl && (
            <div className="searchResultsImagePreview">
              <span className="searchResultsImageLabel">Your image</span>
              <img src={previewImageUrl} alt="uploaded" />
              {history && (
                <button
                  type="button"
                  className="searchResultsImageClose"
                  onClick={() => history.push("/")}
                  aria-label="Remove image and go to home"
                  title="Remove image and go to home"
                >
                  ×
                </button>
              )}
            </div>
          )}

          {loading && <div className="resultsLoading">Loading products…</div>}
          {emptyMessage && <div className="resultsEmpty">{emptyMessage}</div>}

          {!loading && (
            <div className="resultsGrid">
              {sortedItems.map((product, idx) => (
                <ProductCard key={getProductIdentifier(product, idx)} product={product} onClick={onProductClick} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const SearchResultsPage = () => {
  const location = useLocation();
  const history = useHistory();

  const {
    mode = "text",
    query = "",
    category = "all",
    subcategory = "all",
    previewImageUrl,
    results = [],
    total = 0,
    searchStrategy = null,
  } = location.state || {};

  const headingCategory =
    subcategory && subcategory !== "all"
      ? subcategory
      : category && category !== "all"
      ? category
      : "";

  return (
    <ProductResultsExperience
      title={headingCategory || "Shop all"}
      query={query}
      mode={mode}
      items={results}
      total={total || results.length}
      previewImageUrl={previewImageUrl}
      error={
        !results.length && query
          ? "No products found for this search. Showing similar products below."
          : ""
      }
      searchStrategy={searchStrategy}
      history={history}
      onProductClick={(product) => {
        if (!product) return;
        const target = product.slug || product.id;
        if (target) {
          history.push(`/product/${target}`);
        }
      }}
    />
  );
};

export default SearchResultsPage;