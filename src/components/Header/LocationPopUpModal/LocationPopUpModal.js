import React, { useState } from "react";
import "./LocationPopUpModal.css";

function LocationPopUpModal({
  onClose,
  locLoading,
  locError,
  onApplyLocation,
  onUseMyLocation,
  currentLocation,
}) {
  // local controlled input for the ZIP/city form
  const [inputText, setInputText] = useState("");

  const handleApply = () => {
    onApplyLocation(inputText);
  };

  return (
    <div className="locModal-overlay" onClick={onClose}>
      <div
        className="locModal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="locModal-header">
          <div className="locModal-titleGroup">
            <div className="locModal-title">Choose your location</div>
            <div className="locModal-subtitle">
              Set your delivery location to see product availability and faster
              delivery options.
            </div>
          </div>

          <button
            className="locModal-closeBtn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* CURRENT LOCATION DISPLAY */}
        <div className="locModal-current">
          <div className="locModal-current-label">Current</div>
          <div className="locModal-current-value">
            <span
              className="locModal-pin"
              role="img"
              aria-label="pin"
            >
              📍
            </span>
            <span className="locModal-current-text">{currentLocation}</span>
          </div>
        </div>

        {/* MANUAL INPUT */}
        <div className="locModal-section">
          <label className="locModal-inputLabel">
            Enter ZIP code or city
          </label>

          <div className="locModal-row">
            <input
              className="locModal-input"
              placeholder="e.g. 45324 or Dayton, OH"
              value={inputText}
              disabled={locLoading}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              className="locModal-applyBtn"
              disabled={locLoading}
              onClick={handleApply}
            >
              {locLoading ? "Saving..." : "Apply"}
            </button>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="locModal-dividerRow">
          <span className="locModal-dividerLine" />
          <span className="locModal-dividerText">or</span>
          <span className="locModal-dividerLine" />
        </div>

        {/* GEOLOCATION BUTTON */}
        <div className="locModal-section">
          <button
            className="locModal-geoBtn"
            disabled={locLoading}
            onClick={onUseMyLocation}
          >
            {locLoading
              ? "Detecting your location..."
              : "Use my current location"}
          </button>
        </div>

        {/* ERROR */}
        {locError && (
          <div className="locModal-error">{locError}</div>
        )}
      </div>
    </div>
  );
}

export default LocationPopUpModal;
