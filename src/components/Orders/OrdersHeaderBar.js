import React from "react";
import "./OrdersHeaderBar.css";

export default function OrdersHeaderBar({ searchQuery, onSearchChange }) {
  return (
    <div className="ordersHeaderBar">
      <h1 className="ordersHeaderBar-title">Your Orders</h1>

      <div className="ordersHeaderBar-searchWrapper">
        <div className="ordersHeaderBar-searchInputWrapper">
          <span className="ordersHeaderBar-searchIcon">🔍</span>
          <input
            className="ordersHeaderBar-searchInput"
            placeholder="Search all orders"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <button className="ordersHeaderBar-searchBtn">
          Search Orders
        </button>
      </div>
    </div>
  );
}
