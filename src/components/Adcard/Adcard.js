// src/components/AdCard/AdCard.js
import React from "react";
import "./AdCard.css";

export default function AdCard() {
  return (
    <div className="adCard">
      <div className="adCard-inner">
        <div className="adCard-left">
          <div className="adCard-headline">Fidelity Go®</div>
          <div className="adCard-sub">
            Invest your money. Not your time.
          </div>
          <div className="adCard-small">
            No advisory fees under $25K.
          </div>
          <button className="adCard-ctaBtn">Get started</button>
          <div className="adCard-legal">
            Fidelity Brokerage Services LLC, Member NYSE, SIPC
          </div>
        </div>

        <div className="adCard-right">
          <div className="adCard-imagePlaceholder">
            {/* Replace this with actual img */}
          </div>
        </div>
      </div>

      <div className="adCard-sponsored">Sponsored • i</div>
    </div>
  );
}