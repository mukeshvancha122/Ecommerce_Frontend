import React from "react";
import "./SponsoredAdCard.css";

export default function SponsoredAdCard() {
  return (
    <div className="sponsoredCard">
      <div className="sponsoredCard-inner">
        {/* left column */}
        <div className="sponsoredCard-leftBrand">
          <div className="sponsoredCard-logo">ATKINS</div>
          <div className="sponsoredCard-tagline">GLP-1 Friendly</div>
        </div>

        {/* middle product image */}
        <div className="sponsoredCard-productImage">
          <div className="sponsoredCard-productImageBox" />
        </div>

        {/* right product detail */}
        <div className="sponsoredCard-details">
          <div className="sponsoredCard-title">
            Atkins Strong High Protein Shak…
          </div>

          <div className="sponsoredCard-badgeRow">
            <span className="sponsoredCard-badge">Save 10%</span>
            <span className="sponsoredCard-badgeText">
              with Subscribe &amp; Save
            </span>
          </div>

          <div className="sponsoredCard-priceRow">
            <span className="sponsoredCard-priceMain">$25</span>
            <span className="sponsoredCard-priceCents">74</span>
            <span className="sponsoredCard-oldPrice">$25.74</span>
            <span className="sponsoredCard-primeTag">prime</span>
          </div>
        </div>
      </div>

      <div className="sponsoredCard-footer">
        Sponsored <span className="sponsoredCard-infoIcon">ⓘ</span>
      </div>
    </div>
  );
}
