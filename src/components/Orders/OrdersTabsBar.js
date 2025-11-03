import React from "react";
import "./OrdersTabsBar.css";

export default function OrdersTabsBar({ activeTab }) {
  const tabs = [
    "Orders",
    "Buy Again",
    "Not Yet Shipped",
    "Digital Orders",
    "Amazon Pay",
  ];

  return (
    <div className="ordersTabsBar">
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`ordersTabsBar-tab ${
            tab === activeTab ? "ordersTabsBar-tab--active" : ""
          }`}
        >
          {tab}
        </div>
      ))}
    </div>
  );
}
