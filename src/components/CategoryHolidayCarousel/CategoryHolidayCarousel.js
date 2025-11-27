import React, { useRef } from "react";
import { useHistory } from "react-router-dom";
import "./CategoryHolidayCarousel.css";
import { getImageUrl } from "../../utils/imageUtils";

export default function CategoryHolidayCarousel({ categories = [] }) {
  const history = useHistory();
  const scrollRef = useRef(null);

  const scrollTrack = (direction) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const amount = direction === "left" ? -250 : 250;
    container.scrollBy({ left: amount, behavior: "smooth" });
  };

  const handleCategoryClick = (category) => {
    if (category?.slug) {
      history.push(
        `/products?category=${encodeURIComponent(category.slug)}&label=${encodeURIComponent(category.category_name)}`
      );
    }
  };

  const handleExploreClick = () => {
    history.push("/search", {
      mode: "text",
      query: "all categories",
      category: "all",
    });
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="categoryHolidaySection">
      <div className="categoryHolidayHeader">
        <div>
          <h3>Here come Holiday Specials</h3>
        </div>
        <div className="categoryHolidayButtons">
          <button
            type="button"
            className="categoryHolidayArrow"
            aria-label="Previous"
            onClick={() => scrollTrack("left")}
          >
            ‹
          </button>
          <button
            type="button"
            className="categoryHolidayArrow"
            aria-label="Next"
            onClick={() => scrollTrack("right")}
          >
            ›
          </button>
        </div>
      </div>
      <div className="categoryHolidayTrackWrapper">
        <div className="categoryHolidayTrack" ref={scrollRef}>
          {categories.map((category) => {
            // Try multiple possible field names for category image
            let rawImage = 
              category?.category_image || 
              category?.image || 
              category?.img || 
              null;
            
            // Handle if category_image is an object (e.g., {url: "...", thumbnail: "..."})
            if (rawImage && typeof rawImage === 'object') {
              rawImage = rawImage.url || rawImage.image || rawImage.src || null;
            }
            
            // Handle null or empty strings
            if (!rawImage || rawImage === "null" || rawImage === "undefined") {
              rawImage = null;
            }
            
            // Process the image URL - if null, use fallback immediately
            const image = rawImage ? getImageUrl(rawImage) : "/images/NO_IMG.png";
            
            return (
              <button
                key={category.id}
                type="button"
                className="categoryHolidayItem"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="categoryHolidayImage">
                  <img
                    src={image}
                    alt={category.category_name || "Category"}
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
                <div className="categoryHolidayName">{category.category_name}</div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

