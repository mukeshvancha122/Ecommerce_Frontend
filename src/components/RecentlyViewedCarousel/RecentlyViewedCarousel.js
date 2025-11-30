import React, { useState, useEffect, useMemo } from "react";
import { useHistory } from "react-router-dom";
import "./RecentlyViewedCarousel.css";
import { getImageUrl } from "../../utils/imageUtils";
import { formatCurrency as formatCurrencyUtil } from "../../utils/currency";

export default function RecentlyViewedCarousel({ products = [] }) {
  const history = useHistory();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get recently viewed from localStorage
  const recentlyViewed = useMemo(() => {
    try {
      const stored = localStorage.getItem("recentlyViewed");
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error("Error reading recently viewed:", error);
    }
    return [];
  }, []);

  // Get searched products from localStorage
  const searchedProducts = useMemo(() => {
    try {
      const stored = localStorage.getItem("searchedProducts");
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error("Error reading searched products:", error);
    }
    return [];
  }, []);

  // Combine recently viewed and searched products, remove duplicates
  const allProducts = useMemo(() => {
    const combined = [...recentlyViewed, ...searchedProducts];
    const unique = combined.filter((product, index, self) =>
      index === self.findIndex((p) => p.id === product.id || p.slug === product.slug)
    );
    return unique.length > 0 ? unique : products;
  }, [recentlyViewed, searchedProducts, products]);

  const itemsPerPage = 8; // 4 items per row × 2 rows
  const totalPages = Math.ceil(allProducts.length / itemsPerPage) || 1;
  const currentProducts = allProducts.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  // Split into 2 rows
  const row1 = currentProducts.slice(0, 4);
  const row2 = currentProducts.slice(4, 8);

  const goPrev = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const goNext = () => setCurrentIndex((prev) => Math.min(totalPages - 1, prev + 1));

  const handleProductClick = (product) => {
    const identifier = product?.slug || product?.id;
    if (identifier) {
      history.push(`/product/${identifier}`);
    }
  };

  if (allProducts.length === 0) {
    return null;
  }

  return (
    <section className="recentlyViewedSection">
      <header className="recentlyViewedHeader">
        <h2>Recently Viewed & Searched Products</h2>
      </header>

      <div className="recentlyViewedCarousel">
        <button
          className="recentlyViewedArrow recentlyViewedArrow--left"
          onClick={goPrev}
          disabled={currentIndex === 0}
          aria-label="Previous products"
        >
          ‹
        </button>

        <div className="recentlyViewedContent">
          <div className="recentlyViewedRow">
            {row1.map((product, idx) => {
              const variation = product?.product_variations?.[0];
              const rawImg = variation?.product_images?.[0]?.product_image;
              const img = rawImg ? getImageUrl(rawImg) : "/images/NO_IMG.png";
              const priceLabel = formatCurrencyUtil(
                variation?.get_discounted_price ??
                  product?.min_price ??
                  variation?.product_price
              );
              const name = product?.product_name || "Loading…";
              const slug = product?.slug || `product-${idx}`;

              return (
                <div
                  key={slug}
                  className="recentlyViewedCard"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="recentlyViewedCard-image">
                    <img
                      src={img}
                      alt={name}
                      onError={(e) => {
                        e.target.src = "/images/NO_IMG.png";
                      }}
                    />
                  </div>
                  <div className="recentlyViewedCard-name">{name}</div>
                  {priceLabel && (
                    <div className="recentlyViewedCard-price">{priceLabel}</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="recentlyViewedRow">
            {row2.map((product, idx) => {
              const variation = product?.product_variations?.[0];
              const rawImg = variation?.product_images?.[0]?.product_image;
              const img = rawImg ? getImageUrl(rawImg) : "/images/NO_IMG.png";
              const priceLabel = formatCurrencyUtil(
                variation?.get_discounted_price ??
                  product?.min_price ??
                  variation?.product_price
              );
              const name = product?.product_name || "Loading…";
              const slug = product?.slug || `product-${idx + 4}`;

              return (
                <div
                  key={slug}
                  className="recentlyViewedCard"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="recentlyViewedCard-image">
                    <img
                      src={img}
                      alt={name}
                      onError={(e) => {
                        e.target.src = "/images/NO_IMG.png";
                      }}
                    />
                  </div>
                  <div className="recentlyViewedCard-name">{name}</div>
                  {priceLabel && (
                    <div className="recentlyViewedCard-price">{priceLabel}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          className="recentlyViewedArrow recentlyViewedArrow--right"
          onClick={goNext}
          disabled={currentIndex >= totalPages - 1}
          aria-label="Next products"
        >
          ›
        </button>
      </div>

      {totalPages > 1 && (
        <div className="recentlyViewedPagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`recentlyViewedDot ${i === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

