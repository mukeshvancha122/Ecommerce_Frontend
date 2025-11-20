import React from "react";
import "./OrdersHeaderBar.css";
import { useTranslation } from "../../i18n/TranslationProvider";

export default function OrdersHeaderBar({ searchQuery, onSearchChange }) {
  const { t } = useTranslation();
  return (
    <div className="ordersHeaderBar">
      <h1 className="ordersHeaderBar-title">{t("orders.title")}</h1>

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

        <button className="ordersHeaderBar-searchBtn">Search Orders</button>
      </div>
    </div>
  );
}
