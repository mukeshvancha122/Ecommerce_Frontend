import React from "react";
import "./CountryErrorModal.css";

export default function CountryErrorModal({ isOpen, onClose, selectedCountry, addressCountry }) {
  if (!isOpen) return null;

  return (
    <div className="country-error-backdrop" onClick={onClose}>
      <div className="country-error-modal" onClick={(e) => e.stopPropagation()}>
        <div className="country-error-icon">⚠️</div>
        <h2 className="country-error-title">International Shipping Not Available</h2>
        <p className="country-error-message">
          You have selected <strong>{selectedCountry}</strong> as your shipping country, but the address you're trying to use is in <strong>{addressCountry}</strong>.
        </p>
        <p className="country-error-message">
          We currently do not support international shipping. Please select an address within <strong>{selectedCountry}</strong> or change your country preference.
        </p>
        <button className="country-error-button" onClick={onClose}>
          I Understand
        </button>
      </div>
    </div>
  );
}

