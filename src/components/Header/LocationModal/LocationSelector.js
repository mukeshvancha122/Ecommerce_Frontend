// src/components/Header/LocationSelector.js
import React, { useState, useEffect, useCallback } from "react";
import API from "../../../axios";
import LocationModal from "./LocationModal";
import "./LocationSelector.css";

function LocationSelector({ user }) {
  const [addressLabel, setAddressLabel] = useState(
    user?.addressLabel || "Dayton, OH" // something like "Dayton, OH"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);

  // ask backend to reverse geocode browser position
  const detectAndSetLocation = useCallback(async () => {
    if (!navigator.geolocation) return;

    try {
      setDetecting(true);

      // 1. ask browser for position
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
        });
      });

      const { latitude, longitude } = position.coords;

      // 2. ask backend to reverse lookup lat/lng
      const res = await API.post("/api/location/reverse-lookup", {
        lat: latitude,
        lng: longitude,
      });

      const data = res?.data || {};
      // Build label like "Columbus, OH"
      const labelGuess = data.label
        || [data.city, data.state || data.countryCode].filter(Boolean).join(", ");

      if (labelGuess) {
        setAddressLabel(labelGuess);
      }
    } catch (err) {
      console.warn("Auto location failed:", err);
      // we silently ignore here so UI just says "Update location"
    } finally {
      setDetecting(false);
    }
  }, []);

  // on mount:
  // If we don't already have a user location, try to auto-detect
  useEffect(() => {
    if (!addressLabel) {
      detectAndSetLocation();
    }
  }, [addressLabel, detectAndSetLocation]);

  // when modal saves new location
  const handleLocationSaved = (locObj) => {
    // locObj.label should be something nice like "Chicago, IL"
    if (locObj?.label) {
      setAddressLabel(locObj.label);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const finalText = addressLabel || (detecting ? "Detecting..." : "Update location");

  return (
    <>
      <div
        className="header-location"
        onClick={openModal}
        role="button"
        tabIndex={0}
        aria-label="Choose your delivery location"
      >
        <div className="header-location-line1">Deliver to</div>
        <div className="header-location-line2">
          <span
            className="header-location-pin"
            role="img"
            aria-label="pin"
          >
            📍
          </span>
          <span className="header-location-text">{finalText}</span>
        </div>
      </div>

      <LocationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onLocationSaved={handleLocationSaved}
        defaultAddressLabel={addressLabel}
      />
    </>
  );
}

export default LocationSelector;
