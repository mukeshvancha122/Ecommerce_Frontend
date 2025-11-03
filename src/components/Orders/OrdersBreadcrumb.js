import React from "react";
import "./OrdersBreadcrumb.css";

export default function OrdersBreadcrumb() {
  return (
    <nav className="ordersBreadcrumb">
      <a className="ordersBreadcrumb-link" href="#">
        Your Account
      </a>
      <span className="ordersBreadcrumb-sep">›</span>
      <span className="ordersBreadcrumb-current">Your Orders</span>
    </nav>
  );
}
