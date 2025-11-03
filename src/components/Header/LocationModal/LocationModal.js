// src/components/LocationModal/LocationModal.js
import React, { useState } from "react";
import "./LocationModal.css";
import API from "../../../axios";

function LocationModal({
  isOpen,
  onClose,
  onLocationSaved,
  defaultAddressLabel,
}) {
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // Turn browser geolocation error codes into readable text
  const mapGeoError = (err) => {
    if (!err || typeof err.code === "undefined") {
      return "Unable to access location.";
    }
    switch (err.code) {
      case err.PERMISSION_DENIED:
        return "Permission denied. Please allow location access in your browser.";
      case err.POSITION_UNAVAILABLE:
        return "Location unavailable. Check GPS / network.";
      case err.TIMEOUT:
        return "Timed out getting location. Try again.";
      default:
        return "Unable to get current location.";
    }
  };

  // Helper: build short label the header pill will show
  // Priority: city + state + ZIP, fallback gracefully
  const buildLocationLabel = (addr) => {
    // addr pieces coming from reverse geocode
    const {
      cityLike,
      stateLike,
      zipLike,
      countryLike,
    } = addr;

    // Try: "City, ST ZIP"
    if (cityLike && stateLike && zipLike) {
      return `${cityLike}, ${stateLike} ${zipLike}`;
    }

    // Try: "City, ST"
    if (cityLike && stateLike) {
      return `${cityLike}, ${stateLike}`;
    }

    // Try: "City ZIP"
    if (cityLike && zipLike) {
      return `${cityLike} ${zipLike}`;
    }

    // Try: "ZIP, Country"
    if (zipLike && countryLike) {
      return `${zipLike}, ${countryLike}`;
    }

    // City only
    if (cityLike) {
      return cityLike;
    }

    // ZIP only
    if (zipLike) {
      return zipLike;
    }

    // Country fallback
    if (countryLike) {
      return countryLike;
    }

    return "Your location";
  };

  // "Use my current location" WITHOUT using our backend.
  // We'll call browser geolocation + OpenStreetMap Nominatim directly.
  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setErrMsg("Geolocation is not supported in this browser.");
      return;
    }

    try {
      setLoading(true);
      setErrMsg("");

      // 1. get browser coords
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });

      const { latitude, longitude } = position.coords;

      if (
        typeof latitude !== "number" ||
        typeof longitude !== "number"
      ) {
        setErrMsg("Got an invalid position from browser.");
        setLoading(false);
        return;
      }

      // 2. Call OpenStreetMap Nominatim reverse geocoding directly from frontend
      // NOTE: This is a public service. For production at real scale you'd proxy through backend
      // to respect rate limits and add a proper User-Agent.
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
        latitude
      )}&lon=${encodeURIComponent(longitude)}&addressdetails=1`;

      const resp = await fetch(url, {
        headers: {
          // identify yourself; polite for Nominatim usage
          "Accept": "application/json",
        },
      });

      if (!resp.ok) {
        console.error("Reverse geocode HTTP error:", resp.status);
        setErrMsg("Couldn't look up address from location.");
        setLoading(false);
        return;
      }

      const data = await resp.json();
      const address = data.address || {};

      // Nominatim returns different keys depending on country. We'll try several.
      const cityLike =
        address.city ||
        address.town ||
        address.village ||
        address.hamlet ||
        address.suburb ||
        "";

      const stateLike =
        address.state ||
        address.region ||
        address.province ||
        address.county ||
        "";

      const zipLike = address.postcode || "";

      const countryLike = address.country || "";
      const countryCodeLike = address.country_code
        ? address.country_code.toUpperCase()
        : countryCode;

      // Fill the form fields so user can edit if they want
      setCity(cityLike);
      setStateRegion(stateLike);
      setPostalCode(zipLike);
      setCountryCode(countryCodeLike || "US");

      // Not an error → clear
      setErrMsg("");
    } catch (geoErr) {
      console.error("Geolocation / reverse lookup failed:", geoErr);
      setErrMsg(mapGeoError(geoErr));
    } finally {
      setLoading(false);
    }
  };

  // User clicks "Save location"
  const handleSave = async (e) => {
    e.preventDefault();

    // Require something meaningful
    if (!postalCode && !city) {
      setErrMsg("Please enter at least a ZIP/postal code or city / area.");
      return;
    }

    try {
      setLoading(true);
      setErrMsg("");

      // Build display label that will show in the header pill
      const label = buildLocationLabel({
        cityLike: city,
        stateLike: stateRegion,
        zipLike: postalCode,
        countryLike: countryCode,
      });

      const toSave = {
        label,
        postalCode,
        city,
        state: stateRegion,
        countryCode,
      };

      // OPTIONAL: Persist on backend.
      // You can keep this if you do want to store user's preferred ship-to location in DB.
      // If you don't want ANY backend here either, you can remove this try/catch block.
      try {
        await API.post("/api/location/set", toSave);
      } catch (saveErr) {
        console.warn(
          "Location save to backend failed (non-blocking):",
          saveErr
        );
        // We won't block the UI if backend isn't ready.
      }

      // Update header pill immediately
      onLocationSaved(toSave);

      // Close modal
      onClose();
    } catch (err) {
      console.error("Unexpected error in save:", err);
      setErrMsg("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="locModal-overlay" role="dialog" aria-modal="true">
      <div className="locModal-card">
        {/* header row */}
        <div className="locModal-header">
          <div className="locModal-title">Choose your location</div>
          <button
            className="locModal-closeBtn"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>

        <p className="locModal-desc">
          Select a delivery location to see product availability and shipping
          options.
        </p>

        <button
          className="locModal-gpsBtn"
          onClick={handleUseCurrentLocation}
          disabled={loading}
          type="button"
        >
          📍 Use my current location
        </button>

        <div className="locModal-sepText">or enter a delivery location</div>

        {/* manual entry form */}
        <form className="locModal-form" onSubmit={handleSave}>
          <label className="locModal-field">
            <span className="locModal-label">ZIP / Postal Code</span>
            <input
              className="locModal-input"
              id="postalCode"
              name="postalCode"
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="e.g. 10001"
              disabled={loading}
            />
          </label>

          <div className="locModal-row">
            <label className="locModal-field">
              <span className="locModal-label">City / Area</span>
              <input
                className="locModal-input"
                id="city"
                name="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Dayton"
                disabled={loading}
              />
            </label>

            <label className="locModal-field">
              <span className="locModal-label">State / Region</span>
              <input
                className="locModal-input"
                id="stateRegion"
                name="stateRegion"
                type="text"
                value={stateRegion}
                onChange={(e) => setStateRegion(e.target.value)}
                placeholder="OH"
                disabled={loading}
              />
            </label>
          </div>

          <label className="locModal-field">
            <span className="locModal-label">Country</span>
            <input
              className="locModal-input"
              id="countryCode"
              name="countryCode"
              type="text"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              placeholder="US"
              disabled={loading}
            />
          </label>

          {errMsg && <div className="locModal-error">{errMsg}</div>}

          <button
            type="submit"
            className="locModal-saveBtn"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save location"}
          </button>
        </form>

        {defaultAddressLabel && (
          <div className="locModal-footerNote">
            Current: {defaultAddressLabel}
          </div>
        )}
      </div>
    </div>
  );
}

export default LocationModal;