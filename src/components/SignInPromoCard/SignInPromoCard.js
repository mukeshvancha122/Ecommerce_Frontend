// src/components/SignInPromoCard/SignInPromoCard.js
import React from "react";
import "./SignInPromoCard.css";

export default function SignInPromoCard() {
  return (
    <div className="signInPromoCard">
      <div className="signInPromoCard-heading">
        Sign in for the best experience
      </div>

      <button className="signInPromoCard-btn">Sign in securely</button>
    </div>
  );
}