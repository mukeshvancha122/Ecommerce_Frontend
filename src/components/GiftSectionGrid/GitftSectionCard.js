import React from "react";
import "./GiftSectionCard.css";

export default function GiftSectionCard({ title, tiles, footerText }) {
  return (
    <div className="giftSectionCard-wrapper">
      <div className="giftSectionCard-title">{title}</div>

      <div className="giftSectionCard-tilesGrid">
        {tiles.map((tile, idx) => (
          <div className="giftTile" key={idx}>
            <div className="giftTile-imgWrapper">
              <img
                src={tile.img}
                alt={tile.label}
                className="giftTile-img"
              />
            </div>
            <div className="giftTile-label">{tile.label}</div>
          </div>
        ))}
      </div>

      <a className="giftSectionCard-footerLink" href="#">
        {footerText} &rsaquo;
      </a>
    </div>
  );
}