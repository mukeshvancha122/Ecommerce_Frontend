import React, { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import "./ExcitingDealsCarousel.css";
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

export default function ExcitingDealsCarousel({ products = [] }) {
  const history = useHistory();
  const [index, setIndex] = useState(0);

  const itemsPerView = 5;
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const discountA =
        parseNumber(
          a?.product_variations?.[0]?.get_discounted_price?.active_discount_percentage
        ) ?? parseNumber(a?.product_discount) ?? 0;
      const discountB =
        parseNumber(
          b?.product_variations?.[0]?.get_discounted_price?.active_discount_percentage
        ) ?? parseNumber(b?.product_discount) ?? 0;
      return discountB - discountA;
    });
  }, [products]);

  const pages = Math.ceil(sortedProducts.length / itemsPerView) || 1;
  const currentProducts = sortedProducts.slice(
    index * itemsPerView,
    (index + 1) * itemsPerView
  );

  const goPrev = () => setIndex((prev) => Math.max(0, prev - 1));
  const goNext = () => setIndex((prev) => Math.min(pages - 1, prev + 1));

  const handleClick = (product) => {
    const identifier = product?.slug || product?.id;
    if (identifier) {
      history.push(`/product/${identifier}`);
    }
  };

  if (products.length === 0) {
    return null; // Don't render if no products
  }

  return (
    <section className="excitingDealsSection">
      <div className="excitingDealsHeader">
        <h2>Exciting Deals</h2>
      </div>
      <div className="excitingDealsCarousel">
        <button
          className="excitingDealsArrow excitingDealsArrow--left"
          onClick={goPrev}
          disabled={index === 0}
          aria-label="Previous deals"
        >
          ‹
        </button>
        <div className="excitingDealsTrack">
          {currentProducts.length > 0 ? (
            currentProducts.map((product) => {
              const variation = product?.product_variations?.[0];
              const rawImage =
                variation?.product_images?.[0]?.product_image ||
                product?.product_category?.category_image ||
                null;
              const image = rawImage ? getImageUrl(rawImage) : "/images/NO_IMG.png";
              // Handle discount percentage
              const discount =
                parseNumber(
                  variation?.get_discounted_price?.active_discount_percentage
                ) ?? parseNumber(product?.product_discount) ?? 0;
              
              // Handle price - get_discounted_price can be a number or object
              let price = null;
              const discountedPriceValue = variation?.get_discounted_price;
              if (discountedPriceValue !== null && discountedPriceValue !== undefined) {
                // If it's an object, get final_price; if it's a number, use it directly
                if (typeof discountedPriceValue === 'object' && 'final_price' in discountedPriceValue) {
                  price = parseNumber(discountedPriceValue.final_price);
                } else {
                  price = parseNumber(discountedPriceValue);
                }
              }
              
              // Fallback to other price sources
              price = price ?? parseNumber(variation?.product_price) ?? parseNumber(product?.min_price) ?? 0;
              
              // Original price (before discount)
              const original =
                parseNumber(variation?.product_price) ??
                parseNumber(product?.min_price) ??
                price;

              return (
                <article
                  key={product.id}
                  className="excitingDealCard"
                  onClick={() => handleClick(product)}
                >
                  <div className="excitingDealImageWrapper">
                    <img src={getImageUrl(image)} alt={product.product_name} />
                    {discount > 0 && (
                      <span className="excitingDealBadge">{discount.toFixed(0)}% off</span>
                    )}
                    <span className="excitingDealTag">Exciting Deal</span>
                  </div>
                  <div className="excitingDealPriceRow">
                    <div className="excitingDealPrice">{formatCurrencyUtil(price)}</div>
                    {original > price && (
                      <div className="excitingDealOriginal">{formatCurrencyUtil(original)}</div>
                    )}
                  </div>
                  <div className="excitingDealName">{product.product_name}</div>
                </article>
              );
            })
          ) : (
            <div className="excitingDealsEmpty">No deals available</div>
          )}
        </div>
        <button
          className="excitingDealsArrow excitingDealsArrow--right"
          onClick={goNext}
          disabled={index >= pages - 1}
          aria-label="Next deals"
        >
          ›
        </button>
      </div>
    </section>
  );
}

