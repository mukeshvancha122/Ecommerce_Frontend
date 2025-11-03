// src/components/HolidayCarousel/HolidayCarousel.js
import React from "react";
import "./HolidayCarousel.css";

export default function HolidayCarousel() {
  // These circle tiles in your screenshot:
  // pillow, stocking, tree, antlers, shirt, games...
  const items = [
    { label: "Throw pillows", img: "#c0392b" },
    { label: "Stockings", img: "#006b4c" },
    { label: "Mini tree", img: "#004d2a" },
    { label: "Reindeer decor", img: "#6a3a0a" },
    { label: "Holiday shirts", img: "#8a0f12" },
    { label: "Party games", img: "#10243a" },
    { label: "Gift wrap", img: "#b81e17" },
  ];

  return (
    <div className="holidayCarousel">
      <div className="holidayCarousel-headerRow">
        <h2 className="holidayCarousel-heading">Here comes Christmas!</h2>
      </div>

      <div className="holidayCarousel-wrapper">
        <button className="holidayCarousel-arrow holidayCarousel-arrow--left">
          ‹
        </button>

        <div className="holidayCarousel-track">
          {items.map((item, i) => (
            <div className="holidayCarousel-card" key={i}>
              <div
                className="holidayCarousel-circleBg"
                style={{ backgroundColor: item.img }}
              >
                <div className="holidayCarousel-productMock" />
              </div>
              <div className="holidayCarousel-label">{item.label}</div>
            </div>
          ))}
        </div>

        <button className="holidayCarousel-arrow holidayCarousel-arrow--right">
          ›
        </button>
      </div>
    </div>
  );
}