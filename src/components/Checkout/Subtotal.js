import React from "react";
import "./Subtotal.css";
import { useSelector } from "react-redux";
import { selectCartItems, selectCartTotal } from "../../features/cart/CartSlice";
import { formatCurrency } from "../../utils/format";

export default function Subtotal() {
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="subtotal">
      <p>
        Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}):{" "}
        <strong>{formatCurrency(total, "USD")}</strong>
      </p>

      <small className="subtotal-gift">
        <input type="checkbox" id="gift" /> <label htmlFor="gift">This order contains a gift</label>
      </small>

      <button className="subtotal-proceed">Proceed to Checkout</button>
    </div>
  );
}