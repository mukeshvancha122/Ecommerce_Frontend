// src/components/Header/SubHeader.js
import React from "react";
import "./SubHeader.css";

function SubHeader() {
  return (
    <nav className="subHeader">
      <ul className="subHeader-row">
        {/* "All" menu button */}
        <li className="subHeader-item subHeader-item--all">
          <button className="subHeader-allBtn" type="button">
            <span className="subHeader-allIcon" aria-hidden="true">☰</span>
            <span className="subHeader-allText">All</span>
          </button>
        </li>

        {/* Standard nav links */}
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
  );
}

export default SubHeader;