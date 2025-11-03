import React from "react";
import "./PromoGridRow.css";
import SectionWrapper from "../SectionWrapper/SectionWrapper"; 

export default function PromoGridRow({ cards }) {
  return (
    <SectionWrapper>
      <div className="promoGridRow">
        {cards.map((card, idx) => (
          <div
            className={`promoGridCard ${
              idx !== 0 ? "promoGridCard--borderLeft" : ""
            }`}
            key={idx}
          >
            <div className="promoGridCard-header">
              <div className="promoGridCard-title">{card.title}</div>
              {card.sponsored && (
                <div className="promoGridCard-sponsored">Sponsored • i</div>
              )}
            </div>

            <div className="promoGridCard-body">
              {/* You can customize this body: images, mini-carousel, etc. */}
              {card.children ?? (
                <div className="promoGridCard-placeholder">
                  {/* placeholder block */}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
