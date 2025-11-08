import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import SearchBar from "./SearchBar/SearchBar";
import LocationModal from "./LocationModal/LocationModal";
import { useSelector } from "react-redux";
import { selectCartCount } from "../../features/cart/CartSlice";
import { selectUser, logout } from "../../features/auth/AuthSlice";
import { useDispatch } from "react-redux";


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

const truncate = (str = "", max = 18) =>
  str.length > max ? str.slice(0, max - 1) + "…" : str;

function Header() {
  const dispatch = useDispatch();
  const cartCount = useSelector(selectCartCount);
  const user = useSelector(selectUser);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const handleLocationSaved = (locObj) => setUserLocation(locObj);
  const rawName = (user?.name && user.name.trim()) || deriveNameFromEmail(user?.email);
  const shortName = rawName ? truncate(rawName) : null;

  return (
    <>
      <header className="header">
        {/* LEFT SECTION: Brand + Deliver To */}
        <div className="header-left">
          {/* Brand / Logo */}
          <Link to="/" className="header-logoLink">
            <div className="header-logo">yourshop</div>
          </Link>

          {/* Deliver to ... (click opens modal) */}
          <div className="header-location" onClick={() => setShowLocationModal(true)}>
            <div className="header-location-line1">Deliver to</div>
            <div className="header-location-line2">
              <span className="header-location-pin" role="img" aria-label="pin">📍</span>
              <span className="header-location-text">
                {userLocation?.label || "Update location"}
              </span>
            </div>
          </div>
        </div>

        {/* CENTER SECTION: Search */}
        <SearchBar />

        {/* RIGHT SECTION: Lang / Account / Orders / Cart */}
        <div className="header-right">
          {/* Language selector */}
          <button className="header-lang" aria-label="Language selector" type="button">
            <span className="header-lang-flag" role="img" aria-label="flag">🇺🇸</span>
            <span className="header-lang-code">EN</span>
            <span className="header-lang-caret">▾</span>
          </button>

          {/* Account & Lists */}
          <Link to={user ? "/account" : "/login"} className="header-account">
            <span className="header-account-line1">
              Hello,{" "}
              {shortName ? (
                <span className="header-account-name" title={rawName}>
                  {shortName}
                </span>
              ) : (
                "sign in"
              )}
            </span>
            <span className="header-account-line2">
              Account &amp; Lists <span className="caret">▾</span>
            </span>
          </Link>

          {/* Returns & Orders */}
          <Link to="/orders" className="header-orders">
            <span className="header-orders-line1">Returns</span>
            <span className="header-orders-line2">&amp; Orders</span>
          </Link>

          {/* Cart */}
        <Link to="/checkout" className="header-cart" aria-label={`Cart, ${cartCount || 0} items`}>
          <div className="header-cart-icon" role="img" aria-label="cart">🛒</div>
          <div className="header-cart-info">
            <span
              className="header-cart-count"
              aria-live="polite"
              aria-atomic="true"
            >
              {cartCount || 0}
            </span>
            <span className="header-cart-label">Cart</span>
          </div>
        </Link>
        </div>
      </header>

      {/* Location Modal ("Choose your location") */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSaved={handleLocationSaved}
        defaultAddressLabel={userLocation?.label}
      />
    </>
  );
}

export default Header;
