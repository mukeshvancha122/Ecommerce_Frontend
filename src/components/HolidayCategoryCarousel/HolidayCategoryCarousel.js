import React, { useMemo, useRef } from "react";
import { useHistory } from "react-router-dom";
import "./HolidayCategoryCarousel.css";
import { getImageUrl } from "../../utils/imageUtils";
import { formatCurrency } from "../../utils/currency";

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

const formatPrice = (product) => {
  const variation = product?.product_variations?.[0];
  const price = parsePrice(variation?.get_discounted_price) || 
                parsePrice(variation?.product_price) || 
                parsePrice(product?.min_price);
  return price ? formatCurrency(price) : "";
};

export default function HolidayCategoryCarousel({
  title,
  subtitle,
  items = [],
  onSeeMore,
}) {
  const history = useHistory();
  const scrollRef = useRef(null);

  const carouselItems = useMemo(
    () =>
      items.map((item) => {
        const variation = item?.product_variations?.[0];
        const rawImage =
          variation?.product_images?.[0]?.product_image ||
          item?.product_category?.category_image ||
          null;
        const image = rawImage ? getImageUrl(rawImage) : "/images/NO_IMG.png";
        return {
          id: item.id,
          name: item.product_name,
          price: formatPrice(item),
          slug: item.slug,
          image: image, // Already processed by getImageUrl above
        };
      }),
    [items]
  );

  const scrollTrack = (direction) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const amount = direction === "left" ? -250 : 250;
    container.scrollBy({ left: amount, behavior: "smooth" });
  };

  const handleItemClick = (item) => {
    const identifier = item?.slug || item?.id;
    if (identifier) {
      history.push(`/product/${identifier}`);
    }
  };

  return (
    <div className="holidayCarouselSection">
      <div className="holidayCarouselHeader">
        <div>
          <h3>{title}</h3>
          {subtitle && (
            <button type="button" className="holidayCarouselLink" onClick={onSeeMore}>
              {subtitle}
            </button>
          )}
        </div>
        <div className="holidayCarouselButtons">
          <button
            type="button"
            className="holidayCarouselArrow"
            aria-label="Previous"
            onClick={() => scrollTrack("left")}
          >
            ‹
          </button>
          <button
            type="button"
            className="holidayCarouselArrow"
            aria-label="Next"
            onClick={() => scrollTrack("right")}
          >
            ›
          </button>
        </div>
      </div>
      <div className="holidayCarouselTrackWrapper">
        <div className="holidayCarouselTrack" ref={scrollRef}>
          {carouselItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="holidayCarouselItem"
              onClick={() => handleItemClick(item)}
            >
              <div className="holidayCarouselImage">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  loading="lazy"
                  onError={(e) => {
                    // Prevent infinite loop if fallback also fails
                    if (e.target.src !== "/images/NO_IMG.png" && !e.target.src.includes("NO_IMG")) {
                      e.target.src = "/images/NO_IMG.png";
                      e.target.onerror = null; // Remove error handler to prevent loop
                    }
                  }}
                />
              </div>
              <div className="holidayCarouselName">{item.name}</div>
              {item.price && <div className="holidayCarouselPrice">{item.price}</div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


