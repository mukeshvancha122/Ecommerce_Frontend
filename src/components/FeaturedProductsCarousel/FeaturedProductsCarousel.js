import React, { useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import "./FeaturedProductsCarousel.css";
import { getImageUrl } from "../../utils/imageUtils";
import { formatCurrency as formatCurrencyUtil } from "../../utils/currency";

const parseNumber = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isNaN(value) ? null : value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof value === "object") {
    if ("final_price" in value) return parseNumber(value.final_price);
    if ("amount" in value) return parseNumber(value.amount);
    if ("price" in value) return parseNumber(value.price);
    if ("discounted_price" in value) return parseNumber(value.discounted_price);
  }
  return null;
};

export default function FeaturedProductsCarousel({ products = [] }) {
  const history = useHistory();
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  // Show 10 products, 4 at a time
  const itemsPerPage = 4;
  const displayProducts = products.slice(0, 10);
  const totalPages = Math.ceil(displayProducts.length / itemsPerPage);

  const currentPageProducts = displayProducts.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const handleProductClick = (product) => {
    if (product?.slug) {
      history.push(`/product/${product.slug}`);
    }
  };

  const getProductImage = (product) => {
    const firstVariation = product?.product_variations?.[0];
    const firstImage = firstVariation?.product_images?.[0]?.product_image;
    return firstImage ? getImageUrl(firstImage) : "/images/NO_IMG.png";
  };

  const getProductPrice = (product) => {
    const firstVariation = product?.product_variations?.[0];
    const discountedPrice = parseNumber(firstVariation?.get_discounted_price);
    const minPrice = parseNumber(product?.min_price);
    const variationPrice = parseNumber(firstVariation?.product_price);
    return discountedPrice ?? minPrice ?? variationPrice ?? 0;
  };

  const getOriginalPrice = (product) => {
    const firstVariation = product?.product_variations?.[0];
    return parseNumber(firstVariation?.product_price);
  };

  const getDiscount = (product) => {
    const firstVariation = product?.product_variations?.[0];
    return (
      parseNumber(firstVariation?.get_discounted_price?.active_discount_percentage) || 0
    );
  };

  if (displayProducts.length === 0) {
    return (
      <section className="featuredProductsSection">
        <h2 className="featuredProductsTitle">Featured Products</h2>
        <div className="featuredProductsCarousel">
          <div className="featuredProductsLoading">Loading featured products...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="featuredProductsSection">
      <div className="featuredProductsHeader">
        <h2 className="featuredProductsTitle">Featured Products</h2>
      </div>
      <div className="featuredProductsCarousel">
        <button
          type="button"
          className="featuredProductsArrow featuredProductsArrow--prev"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          aria-label="Previous products"
        >
          ‹
        </button>
        <div className="featuredProductsGrid" ref={carouselRef}>
          {currentPageProducts.map((product) => {
            const imageUrl = getProductImage(product);
            const price = getProductPrice(product);
            const originalPrice = getOriginalPrice(product);
            const discount = getDiscount(product);

            return (
              <div
                key={product.id}
                className="featuredProductCard"
                onClick={() => handleProductClick(product)}
              >
                <div className="featuredProductImageWrapper">
                  <img
                    src={imageUrl}
                    alt={product.product_name}
                    onError={(e) => {
                      e.target.src = "/images/NO_IMG.png";
                    }}
                  />
                  {discount > 0 && (
                    <span className="featuredProductBadge">
                      {discount.toFixed(0)}% OFF
                    </span>
                  )}
                  {product.best_seller && (
                    <span className="featuredProductBadge featuredProductBadge--bestSeller">
                      Best Seller
                    </span>
                  )}
                </div>
                <div className="featuredProductInfo">
                  <h3 className="featuredProductName">{product.product_name}</h3>
                  <div className="featuredProductPrice">
                    {discount > 0 && originalPrice && (
                      <span className="featuredProductOriginalPrice">
                        {formatCurrencyUtil(originalPrice)}
                      </span>
                    )}
                    <span className="featuredProductCurrentPrice">
                      {formatCurrencyUtil(price)}
                    </span>
                  </div>
                  {product.product_description && (
                    <p className="featuredProductDescription">
                      {product.product_description.length > 60
                        ? `${product.product_description.substring(0, 60)}...`
                        : product.product_description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className="featuredProductsArrow featuredProductsArrow--next"
          onClick={handleNext}
          disabled={currentIndex >= totalPages - 1}
          aria-label="Next products"
        >
          ›
        </button>
      </div>
      {totalPages > 1 && (
        <div className="featuredProductsPagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`featuredProductsDot ${i === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

