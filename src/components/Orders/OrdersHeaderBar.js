import React from "react";
import "./OrdersHeaderBar.css";
import { useTranslation } from "../../i18n/TranslationProvider";

export default function OrdersHeaderBar({ searchQuery, onSearchChange, summary = [] }) {
  const { t } = useTranslation();
  return (
    <div className="ordersHeaderBar">
      <div>
        <h1 className="ordersHeaderBar-title">{t("orders.title")}</h1>
        <p className="ordersHeaderBar-subtitle">
          Track packages, manage returns, and reorder your favourites at HyderNexa.
        </p>
      </div>

      <div className="ordersHeaderBar-searchWrapper">
        <div className="ordersHeaderBar-searchInputWrapper">
          <span className="ordersHeaderBar-searchIcon">🔍</span>
          <input
            className="ordersHeaderBar-searchInput"
            placeholder="Search all orders by product, order #, or recipient"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <button className="ordersHeaderBar-searchBtn">Search Orders</button>
      </div>

      <div className="ordersHeaderBar-metrics">
        {summary.map((metric) => (
          <div key={metric.label} className="ordersHeaderBar-metric">
            <p className="ordersHeaderBar-metricLabel">{metric.label}</p>
            <p className="ordersHeaderBar-metricValue">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
