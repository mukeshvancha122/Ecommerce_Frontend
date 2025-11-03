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
            <li>Amazon Newsletter</li>
            <li>About Amazon</li>
            <li>Accessibility</li>
            <li>Sustainability</li>
            <li>Press Center</li>
            <li>Investor Relations</li>
            <li>Amazon Devices</li>
            <li>Amazon Science</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-title">Make Money with Us</h4>
          <ul>
            <li>Sell on Amazon</li>
            <li>Sell apps on Amazon</li>
            <li>Supply to Amazon</li>
            <li>Protect & Build Your Brand</li>
            <li>Become an Affiliate</li>
            <li>Become a Delivery Driver</li>
            <li>Start a Package Delivery Business</li>
            <li>Advertise Your Products</li>
            <li>Self-Publish with Us</li>
            <li>Become an Amazon Hub Partner</li>
            <li className="footer-highlight">› See More Ways to Make Money</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-title">Amazon Payment Products</h4>
          <ul>
            <li>Amazon Visa</li>
            <li>Amazon Store Card</li>
            <li>Amazon Secured Card</li>
            <li>Amazon Business Card</li>
            <li>Shop with Points</li>
            <li>Credit Card Marketplace</li>
            <li>Reload Your Balance</li>
            <li>Gift Cards</li>
            <li>Amazon Currency Converter</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-title">Let Us Help You</h4>
          <ul>
            <li>Your Account</li>
            <li>Your Orders</li>
            <li>Shipping Rates & Policies</li>
            <li>Amazon Prime</li>
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
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
            alt="Amazon logo"
          />
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
