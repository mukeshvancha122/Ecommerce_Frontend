import React, { useState, useEffect } from "react";
import "./SubHeader.css";
import SideNavDrawer from "../../SideNavDrawer/SideNavDrawer";

function SubHeader() {
  const [showSideNav, setShowSideNav] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!showSideNav) return;
    const handleEsc = (e) => e.key === "Escape" && setShowSideNav(false);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showSideNav]);

  return (
    <>
      {/* ======= SUBHEADER NAV ======= */}
      <nav className="subHeader">
        <ul className="subHeader-row">
          <li className="subHeader-item subHeader-item--all">
            <button
              className="subHeader-allBtn"
              type="button"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={showSideNav}
            >
              <span className="subHeader-allIcon" aria-hidden="true">☰</span>
              <span className="subHeader-allText">All</span>
            </button>
          </li>

          {/* ======= MAIN NAV LINKS ======= */}
          <li className="subHeader-item">
            <a className="subHeader-link" href="/holiday-deals">
              Holiday Deals
            </a>
          </li>

          <li className="subHeader-item">
            <a className="subHeader-link" href="/best-sellers">
              Best Sellers
            </a>
          </li>

          <li className="subHeader-item">
            <a className="subHeader-link" href="/new-arrivals">
              New Arrivals <span className="subHeader-caret">▾</span>
            </a>
          </li>

          <li className="subHeader-item">
            <a className="subHeader-link" href="/electronics">
              Electronics <span className="subHeader-caret">▾</span>
            </a>
          </li>

          <li className="subHeader-item">
            <a className="subHeader-link" href="/home-kitchen">
              Home &amp; Kitchen
            </a>
          </li>

          <li className="subHeader-item">
            <a className="subHeader-link" href="/beauty">
              Beauty
            </a>
          </li>

          <li className="subHeader-item">
            <a className="subHeader-link" href="/grocery">
              Grocery <span className="subHeader-caret">▾</span>
            </a>
          </li>

          <li className="subHeader-item">
            <a className="subHeader-link" href="/customer-service">
              Customer Service
            </a>
          </li>
        </ul>
      </nav>

     <SideNavDrawer
  isOpen={open}
  onClose={() => setOpen(false)}
  // loggedIn={/* true/false */}
  onSignOut={() => {
    // call your logout endpoint here, then navigate
    // axios.post('/api/auth/logout', {}, { withCredentials: true }).finally(...)
  }}
  onNavigate={(href) => {
    // router push or window.location
    // history.replace(href)  // v5
    // navigate(href, { replace: true }) // v6
  }}
/>
    </>
  );
}

export default SubHeader;
