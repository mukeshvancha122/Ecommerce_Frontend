import React from "react";
import "./OrdersFilterRow.css";

export default function OrdersFilterRow({
  totalOrders,
  timeRange,
  onTimeRangeChange,
}) {
  const isAllOrders = (timeRange || "").toLowerCase() === "all orders";
  const descriptor = isAllOrders ? " total across " : " placed in ";
  return (
    <div className="ordersFilterRow">
      <div className="ordersFilterRow-left">
        <strong>{totalOrders} {totalOrders === 1 ? "order" : "orders"}</strong>
        <span className="ordersFilterRow-text">{descriptor}</span>
        <select
          className="ordersFilterRow-select"
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value)}
        >
          <option>All orders</option>
          <option>past 3 months</option>
          <option>past 6 months</option>
          <option>past year</option>
          <option>2025</option>
          <option>2024</option>
          <option>older</option>
        </select>
      </div>
    </div>
  );
}
