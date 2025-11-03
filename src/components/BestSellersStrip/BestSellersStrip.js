import React from "react";
import "./BestSellersStrip.css";
import SectionWrapper from "../SectionWrapper/SectionWrapper";

export default function BestSellersStrip({ title, items }) {
  return (
    <SectionWrapper>
      <div className="bestSellers">
        <div className="bestSellers-headRow">
          <div className="bestSellers-title">{title}</div>
        </div>

        <div className="bestSellers-body">
          {/* left arrow */}
          <button
            className="bestSellers-arrow bestSellers-arrow--left"
            aria-label="Previous"
          >
            ‹
          </button>

          {/* row of product hero images */}
          <div className="bestSellers-track">
            {items.map((src, idx) => (
              <div className="bestSellers-item" key={idx}>
                <img
                  className="bestSellers-img"
                  src={src}
                  alt={`item-${idx}`}
                />
              </div>
            ))}
          </div>

          {/* right arrow */}
          <button
            className="bestSellers-arrow bestSellers-arrow--right"
            aria-label="Next"
          >
            ›
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}
