import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import { useStateValue } from "../../StateProvider";

function Header() {
  const [{ cart, user }] = useStateValue();

  const cartCount = cart?.reduce((sum, item) => sum + (item.qty || 1), 0);

  return (
    <header className="header">
      {/* LEFT SECTION: Logo + Location */}
      <div className="header-left">
        {/* Logo / brand */}
        <Link to="/" className="header-logoLink">
          <div className="header-logo">yourshop</div>
        </Link>

        {/* Delivering to ... */}
        <div className="header-location">
          <div className="header-location-line1">Deliver to</div>
          <div className="header-location-line2">
            <span className="header-location-pin" role="img" aria-label="pin">
              📍
            </span>
            <span className="header-location-text">
              {user?.addressLabel || "Update location"}
            </span>
          </div>
        </div>
      </div>

      {/* CENTER SECTION: Search */}
      <div className="header-search">
        <select className="header-search-category" aria-label="Search category">
          <option>All</option>
          <option>Electronics</option>
          <option>Fashion</option>
          <option>Home</option>
          <option>Beauty</option>
        </select>

        <input
          type="text"
          className="header-search-input"
          placeholder="Search products, brands, and categories..."
        />

        <button className="header-search-button" aria-label="Search">
          <span className="header-search-icon">🔍</span>
        </button>
      </div>

      {/* RIGHT SECTION: Lang + Account + Orders + Cart */}
      <div className="header-right">
        {/* Language selector */}
        <button className="header-lang" aria-label="Language selector">
          <span className="header-lang-flag" role="img" aria-label="flag">
            🇺🇸
          </span>
          <span className="header-lang-code">EN</span>
          <span className="header-lang-caret">▾</span>
        </button>

        {/* Account */}
        <Link to={user ? "/account" : "/login"} className="header-account">
          <span className="header-account-line1">
            {user ? `Hello, ${user.name || user.email}` : "Hello, sign in"}
          </span>
          <span className="header-account-line2">
            Account &amp; Lists <span className="caret">▾</span>
          </span>
        </Link>

        {/* Orders / Returns */}
        <Link to="/orders" className="header-orders">
          <span className="header-orders-line1">Returns</span>
          <span className="header-orders-line2">&amp; Orders</span>
        </Link>

        {/* Cart */}
        <Link to="/checkout" className="header-cart">
          <div className="header-cart-icon" role="img" aria-label="cart">
            🛒
          </div>
          <div className="header-cart-info">
            <span className="header-cart-count">{cartCount || 0}</span>
            <span className="header-cart-label">Cart</span>
          </div>
        </Link>
      </div>
    </header>
  );
}

export default Header;
