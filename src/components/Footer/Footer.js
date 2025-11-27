import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      {/* Footer Link Columns */}
      <div className="footer-links">
        <div className="footer-column">
          <h4 className="footer-title">Get to Know Us</h4>
          <ul>
            <li>Careers</li>
            <li>HyderNexa Newsletter</li>
            <li>About HyderNexa</li>
            <li>Accessibility</li>
            <li>Sustainability</li>
            <li>Press Center</li>
            <li>Investor Relations</li>
            <li>HyderNexa Devices</li>
            <li>HyderNexa Science</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-title">Make Money with Us</h4>
          <ul>
            <li>Sell on HyderNexa</li>
            <li>Sell apps on HyderNexa</li>
            <li>Supply to HyderNexa</li>
            <li>Protect & Build Your Brand</li>
            <li>Become an Affiliate</li>
            <li>Become a Delivery Driver</li>
            <li>Start a Package Delivery Business</li>
            <li>Advertise Your Products</li>
            <li>Self-Publish with Us</li>
            <li>Become a HyderNexa Hub Partner</li>
            <li className="footer-highlight">› See More Ways to Make Money</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-title">HyderNexa Payment Products</h4>
          <ul>
            <li>HyderNexa Visa</li>
            <li>HyderNexa Store Card</li>
            <li>HyderNexa Secured Card</li>
            <li>HyderNexa Business Card</li>
            <li>Shop with Points</li>
            <li>Credit Card Marketplace</li>
            <li>Reload Your Balance</li>
            <li>Gift Cards</li>
            <li>HyderNexa Currency Converter</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-title">Let Us Help You</h4>
          <ul>
            <li>Your Account</li>
            <li>Your Orders</li>
            <li>Shipping Rates & Policies</li>
            <li>HyderNexa Prime</li>
            <li>Returns & Replacements</li>
            <li>Manage Your Content and Devices</li>
            <li>Recalls and Product Safety Alerts</li>
            <li>Registry & Gift List</li>
            <li>Help</li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-logo">
          <span className="footer-logo-brand">
            <span className="footer-logo-brand-highlight">Hy</span>derNexa
          </span>
        </div>
        <div className="footer-locale">
          <div className="footer-select">
            🌐 English
            <span className="footer-select-arrow">▾</span>
          </div>
          <div className="footer-select">
            🇺🇸 United States
            <span className="footer-select-arrow">▾</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
