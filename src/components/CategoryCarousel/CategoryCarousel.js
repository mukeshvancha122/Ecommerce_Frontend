import React from "react";
import "./CategoryCarousel.css";

export default function CategoryCarousel({ items }) {
  return (
    <div className="catCarousel">
      {/* left arrow */}
      <button
        className="catCarousel-arrow catCarousel-arrow--left"
        aria-label="Previous"
      >
        ‹
      </button>

      {/* scroll track */}
      <div className="catCarousel-track">
        {items.map((item, idx) => (
          <div className="catCarousel-item" key={idx}>
            {item.href ? (
              <a className="catCarousel-circle" href={item.href}>
                <img
                  className="catCarousel-img"
                  src={item.img}
                  alt={item.label}
                />
              </a>
            ) : (
              <div className="catCarousel-circle">
                <img
                  className="catCarousel-img"
                  src={item.img}
                  alt={item.label}
                />
              </div>
            )}
            <div className="catCarousel-label">{item.label}</div>
          </div>
        ))}
      </div>

      {/* right arrow */}
      <button
        className="catCarousel-arrow catCarousel-arrow--right"
        aria-label="Next"
      >
        ›
      </button>
    </div>
  );
}
