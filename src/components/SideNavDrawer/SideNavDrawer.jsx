import React, { useEffect, useState } from "react";
import "./SideNavDrawer.css";

export default function SideNavDrawer({
  isOpen,
  onClose,
  onNavigate,    
  loggedIn = false,
  onSignOut,      
}) {
  const [deptOpen, setDeptOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);

  // Lock scroll + close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  const goto = (href) => {
    onNavigate?.(href);
    onClose?.();
  };

  const HelpSettings = () => (
    <div className="snd-section snd-section--help">
      <div className="snd-sectionTitle">Help &amp; Settings</div>
      <ul className="snd-list">
        <li className="snd-row" onClick={() => goto("/account")}>
          <span className="snd-rowLabel">Your Account</span>
        </li>
        <li className="snd-row" onClick={() => goto("/language")}>
          <span className="snd-leadingIcon">🌐</span>
          <span className="snd-rowLabel">English</span>
        </li>
        <li className="snd-row" onClick={() => goto("/country")}>
          <span className="snd-leadingIcon">🇺🇸</span>
          <span className="snd-rowLabel">United States</span>
        </li>
        <li className="snd-row" onClick={() => goto("/help")}>
          <span className="snd-rowLabel">Customer Service</span>
        </li>
        <li
          className={`snd-row ${loggedIn ? "snd-row--danger" : ""}`}
          onClick={() => {
            if (loggedIn) onSignOut?.();
            goto("/login");
          }}
        >
          <span className="snd-rowLabel">{loggedIn ? "Sign Out" : "Sign in"}</span>
        </li>
      </ul>
    </div>
  );

  return (
    <>
      <div
        className={`snd-overlay ${isOpen ? "snd-overlay--visible" : ""}`}
        onClick={onClose}
      />
      <aside
        className={`snd-drawer ${isOpen ? "snd-drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="snd-header">
          <div className="snd-avatar" aria-hidden="true">👤</div>
          <div className="snd-hello">{loggedIn ? "Hello" : "Hello, sign in"}</div>
          <button className="snd-close" aria-label="Close menu" onClick={onClose}>
            <span className="snd-closeX" aria-hidden>✕</span>
          </button>
        </div>

        {/* Scroll body */}
        <div className="snd-scroll">
          {/* Trending */}
          <div className="snd-section">
            <div className="snd-sectionTitle">Trending</div>
            <ul className="snd-list">
              <li className="snd-row snd-row--chev" onClick={() => goto("/best-sellers")}>
                <span className="snd-rowLabel">Best Sellers</span>
                <span className="snd-chev">›</span>
              </li>
              <li className="snd-row snd-row--chev" onClick={() => goto("/new-releases")}>
                <span className="snd-rowLabel">New Releases</span>
                <span className="snd-chev">›</span>
              </li>
              <li className="snd-row snd-row--chev" onClick={() => goto("/movers-shakers")}>
                <span className="snd-rowLabel">Movers &amp; Shakers</span>
                <span className="snd-chev">›</span>
              </li>
            </ul>
          </div>

          <div className="snd-divider" />

          {/* Digital Content & Devices */}
          <div className="snd-section">
            <div className="snd-sectionTitle">Digital Content &amp; Devices</div>
            <ul className="snd-list">
              {[
                "Prime Video",
                "Amazon Music",
                "Echo & Alexa",
                "Fire Tablets",
                "Fire TV",
                "Amazon Luna",
                "Kindle E-readers & Books",
                "Audible Books & Originals",
                "Amazon Photos",
                "Amazon Appstore",
              ].map((label) => (
                <li key={label} className="snd-row snd-row--chev" onClick={() => goto(`/${label.toLowerCase().replace(/[ &']/g,"-")}`)}>
                  <span className="snd-rowLabel">{label}</span>
                  <span className="snd-chev">›</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="snd-divider" />

          {/* Shop by Department with "See all" */}
          <div className="snd-section">
            <div className="snd-sectionTitle">Shop by Department</div>
            <ul className="snd-list">
              <li className="snd-row snd-row--chev" onClick={() => goto("/clothing-shoes-jewelry-watches")}>
                <span className="snd-rowLabel">Clothing, Shoes, Jewelry &amp; Watches</span>
                <span className="snd-chev">›</span>
              </li>
              {deptOpen && (
                <>
                  <li className="snd-row snd-row--chev" onClick={() => goto("/amazon-fresh")}>
                    <span className="snd-rowLabel">Amazon Fresh</span>
                    <span className="snd-chev">›</span>
                  </li>
                  <li className="snd-row snd-row--chev" onClick={() => goto("/whole-foods-market")}>
                    <span className="snd-rowLabel">Whole Foods Market</span>
                    <span className="snd-chev">›</span>
                  </li>
                  <li className="snd-row snd-row--chev" onClick={() => goto("/books")}>
                    <span className="snd-rowLabel">Books</span>
                    <span className="snd-chev">›</span>
                  </li>
                </>
              )}
              <li
                className="snd-row snd-row--seeall"
                onClick={() => setDeptOpen((v) => !v)}
              >
                <span className="snd-rowLabel">See all</span>
                <span className={`snd-caret ${deptOpen ? "snd-caret--up" : ""}`}>▾</span>
              </li>
            </ul>
          </div>

          <div className="snd-divider" />

          {/* Programs & Features with "See all" */}
          <div className="snd-section">
            <div className="snd-sectionTitle">Programs &amp; Features</div>
            <ul className="snd-list">
              <li className="snd-row snd-row--chev" onClick={() => goto("/medical-care-pharmacy")}>
                <span className="snd-rowLabel">Medical Care &amp; Pharmacy</span>
                <span className="snd-chev">›</span>
              </li>
              {programsOpen && (
                <>
                  <li className="snd-row snd-row--chev" onClick={() => goto("/amazon-physical-stores")}>
                    <span className="snd-rowLabel">Amazon Physical Stores</span>
                    <span className="snd-chev">›</span>
                  </li>
                  <li className="snd-row snd-row--chev" onClick={() => goto("/amazon-haul")}>
                    <span className="snd-rowLabel">Amazon Haul</span>
                    <span className="snd-chev">›</span>
                  </li>
                  <li className="snd-row snd-row--chev" onClick={() => goto("/amazon-business")}>
                    <span className="snd-rowLabel">Amazon Business</span>
                    <span className="snd-chev">›</span>
                  </li>
                </>
              )}
              <li
                className="snd-row snd-row--seeall"
                onClick={() => setProgramsOpen((v) => !v)}
              >
                <span className="snd-rowLabel">See all</span>
                <span className={`snd-caret ${programsOpen ? "snd-caret--up" : ""}`}>▾</span>
              </li>
            </ul>
          </div>

          <div className="snd-divider" />

          <HelpSettings />
        </div>
      </aside>
    </>
  );
}
