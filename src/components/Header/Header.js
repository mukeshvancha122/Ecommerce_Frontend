import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import SearchBar from "./SearchBar/SearchBar";
import LocationModal from "./LocationModal/LocationModal";
import { useSelector, useDispatch } from "react-redux";
import { useCart } from "../../hooks/useCart";
import { selectUser } from "../../features/auth/AuthSlice";
import { selectLanguage, setLanguage } from "../../features/locale/localeSlice";
import { selectAddresses, selectSelectedAddressId } from "../../features/checkout/CheckoutSlice";
import { supportedLanguages } from "../../i18n/translations";
import { useTranslation } from "../../i18n/TranslationProvider";

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const deriveNameFromEmail = (email = "") => {
  const local = email.includes("@") ? email.split("@")[0] : email;
  if (!local) return "";
  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(capitalize)
    .join(" ");
};

const truncate = (str = "", max = 18) => (str.length > max ? `${str.slice(0, max - 1)}…` : str);

function Header() {
  const dispatch = useDispatch();
  const { count: cartCount } = useCart();
  const user = useSelector(selectUser);
  const language = useSelector(selectLanguage);
  const addresses = useSelector(selectAddresses);
  const selectedAddressId = useSelector(selectSelectedAddressId);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const langButtonRef = useRef(null);
  const { t } = useTranslation();

  // Format address to show only: city, state, zipcode, country
  const formatAddressDisplay = (address) => {
    if (!address) return null;
    const parts = [];
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zip || address.postalCode) parts.push(address.zip || address.postalCode);
    if (address.country) parts.push(address.country);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  // Get selected address from checkout or saved location
  const selectedAddress = selectedAddressId 
    ? addresses.find(addr => addr.id === selectedAddressId)
    : null;

  // Load saved location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation_v1");
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        setUserLocation(parsed);
      } catch (err) {
        console.error("Error loading saved location:", err);
      }
    }
  }, []);

  // Update location display when checkout address changes (priority: selectedAddress > saved location)
  useEffect(() => {
    if (selectedAddress) {
      const formatted = formatAddressDisplay(selectedAddress);
      if (formatted) {
        const locationObj = {
          label: formatted,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipcode: selectedAddress.zip || selectedAddress.postalCode,
          country: selectedAddress.country,
          postalCode: selectedAddress.zip || selectedAddress.postalCode,
          countryCode: selectedAddress.countryCode || selectedAddress.country,
        };
        setUserLocation(locationObj);
        // Save to localStorage
        localStorage.setItem("userLocation_v1", JSON.stringify(locationObj));
      }
    } else {
      // If no selected address, try to load from localStorage
      const savedLocation = localStorage.getItem("userLocation_v1");
      if (savedLocation && !userLocation) {
        try {
          const parsed = JSON.parse(savedLocation);
          setUserLocation(parsed);
        } catch (err) {
          console.error("Error loading saved location:", err);
        }
      }
    }
  }, [selectedAddress, selectedAddressId]);

  const handleLocationSaved = (locObj) => {
    setUserLocation(locObj);
    // Save to localStorage
    localStorage.setItem("userLocation_v1", JSON.stringify(locObj));
  };

  const rawName = (user?.name && user.name.trim()) || deriveNameFromEmail(user?.email);
  const shortName = rawName ? truncate(rawName) : null;
  const currentLanguage = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langButtonRef.current && !langButtonRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="header">
        <div className="header-left">
          <Link to="/" className="header-logoLink" aria-label="HyderNexa Home">
            <span className="header-logo-brand">
              <span className="header-logo-brand-highlight">Hy</span>Na
            </span>
          </Link>

          <div className="header-location" onClick={() => setShowLocationModal(true)}>
            <div className="header-location-line1">{t("header.deliverTo")}</div>
            <div className="header-location-line2">
              <span className="header-location-pin" role="img" aria-label="pin">
                📍
              </span>
              <span className="header-location-text">
                {userLocation?.label || formatAddressDisplay(selectedAddress) || t("header.updateLocation")}
              </span>
            </div>
          </div>
        </div>

        <SearchBar />

        <div className="header-right">
          <div className="header-lang-wrapper" ref={langButtonRef}>
            <button
              className="header-lang"
              aria-label={`${t("header.language")}: ${currentLanguage.label}`}
              type="button"
              onClick={() => setShowLanguageMenu((open) => !open)}
            >
              <span className="header-lang-flag" role="img" aria-label="flag">
                {currentLanguage.flag}
              </span>
              <span className="header-lang-code">{currentLanguage.code.toUpperCase()}</span>
              <span className="header-lang-caret">▾</span>
            </button>
            {showLanguageMenu && (
              <div className="header-lang-menu">
                {supportedLanguages.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    className={`header-lang-menuItem ${item.code === currentLanguage.code ? "is-active" : ""}`}
                    onClick={() => {
                      dispatch(setLanguage(item.code));
                      setShowLanguageMenu(false);
                    }}
                  >
                    <span role="img" aria-label={item.label}>
                      {item.flag}
                    </span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to={user ? "/account" : "/login"} className="header-account">
            <span className="header-account-line1">
              {t("header.accountHello")}
              {", "}
              {shortName ? (
                <span className="header-account-name" title={rawName}>
                  {shortName}
                </span>
              ) : (
                t("header.signIn")
              )}
            </span>
            <span className="header-account-line2">
              {t("header.accountLists")} <span className="caret">▾</span>
            </span>
          </Link>

          <Link to="/orders" className="header-orders">
            <span className="header-orders-line1">{t("header.returns")}</span>
            <span className="header-orders-line2">{t("header.orders")}</span>
          </Link>

          <Link
            to="/proceed-to-checkout"
            className="header-cart"
            aria-label={`${t("header.cart")}, ${cartCount || 0} items`}
          >
            <div className="header-cart-icon-wrapper">
              <div className="header-cart-icon" role="img" aria-label="cart">
                🛒
              </div>
              {cartCount > 0 && (
                <span className="header-cart-count" aria-live="polite" aria-atomic="true">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="header-cart-info">
              <span className="header-cart-label">{t("header.cart")}</span>
            </div>
          </Link>
        </div>
      </header>

      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSaved={handleLocationSaved}
        defaultAddressLabel={userLocation?.label}
        defaultAddress={selectedAddress}
      />
    </>
  );
}

export default Header;
