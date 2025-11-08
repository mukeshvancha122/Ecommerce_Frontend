import React from "react";
import "./SellerPanel.css";
import { formatCurrency } from "../../../utils/format";

export default function SellerPanel({ alternatives=[], currency="USD" }) {
  if (!alternatives.length) {
    return (
      <div className="card seller">
        <h3 className="seller__title">Other sellers</h3>
        <p className="seller__empty">No alternate sellers listed.</p>
      </div>
    );
  }
  return (
    <div className="card seller">
      <h3 className="seller__title">Other sellers on our store</h3>
      <ul className="seller__list">
        {alternatives.map((s, i) => (
          <li key={i} className="seller__row">
            <div className="seller__name">{s.name}</div>
            <div className="seller__price">{formatCurrency(s.price, currency)}</div>
            <button className="btn">View</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
