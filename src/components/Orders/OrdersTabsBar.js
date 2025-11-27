import React from "react";
import "./OrdersTabsBar.css";

export default function OrdersTabsBar({ activeTab, onTabChange, options }) {
  const tabs = options || [
    { id: "orders", label: "Orders" },
    { id: "buyAgain", label: "Buy Again" },
    { id: "notShipped", label: "Not Yet Shipped" },
    { id: "digital", label: "Digital Orders" },
    { id: "amazonPay", label: "HyderNexa Pay" },
  ];

  return (
    <div className="ordersTabsBar">
      {tabs.map((tab) => (
        <button
          type="button"
          key={tab.id}
          className={`ordersTabsBar-tab ${
            tab.id === activeTab ? "ordersTabsBar-tab--active" : ""
          }`}
          onClick={() => onTabChange?.(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
