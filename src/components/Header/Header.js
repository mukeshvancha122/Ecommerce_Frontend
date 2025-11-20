import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import SearchBar from "./SearchBar/SearchBar";
import LocationModal from "./LocationModal/LocationModal";
import { useSelector, useDispatch } from "react-redux";
import { selectCartCount } from "../../features/cart/CartSlice";
import { selectUser } from "../../features/auth/AuthSlice";
import { selectLanguage, setLanguage } from "../../features/locale/localeSlice";
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
  const cartCount = useSelector(selectCartCount);
  const user = useSelector(selectUser);
  const language = useSelector(selectLanguage);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const langButtonRef = useRef(null);
  const { t } = useTranslation();

  const handleLocationSaved = (locObj) => setUserLocation(locObj);
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
          <Link to="/" className="header-logoLink">
            <div className="header-logo">{t("brand")}</div>
          </Link>

          <div className="header-location" onClick={() => setShowLocationModal(true)}>
            <div className="header-location-line1">{t("header.deliverTo")}</div>
            <div className="header-location-line2">
              <span className="header-location-pin" role="img" aria-label="pin">
                📍
              </span>
              <span className="header-location-text">
                {userLocation?.label || t("header.updateLocation")}
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
            <div className="header-cart-icon" role="img" aria-label="cart">
              🛒
            </div>
            <div className="header-cart-info">
              <span className="header-cart-count" aria-live="polite" aria-atomic="true">
                {cartCount || 0}
              </span>
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
      />
    </>
  );
}

export default Header;
