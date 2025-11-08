import React from "react";
import "./Subtotal.css";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { selectCartItems, selectCartTotal } from "../../features/cart/CartSlice";
import { selectUser } from "../../features/auth/AuthSlice";
import { formatCurrency } from "../../utils/format";

export default function Subtotal() {
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const user = useSelector(selectUser);
  const history = useHistory();

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  const handleProceedToCheckout = () => {
    // if (!user) {
      // If not logged in, send them to login
      // and remember the page they wanted to visit
    //   history.push({
    //     pathname: "/login",
    //     state: { from: "/secure-checkout" },
    //   });
    // } else {
      // Logged in — go to secure checkout
      history.push("/proceed-to-checkout");
    // }
  };

  return (
    <div className="subtotal">
      <p>
        Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}):{" "}
        <strong>{formatCurrency(total, "USD")}</strong>
      </p>

      <small className="subtotal-gift">
        <input type="checkbox" id="gift" />{" "}
        <label htmlFor="gift">This order contains a gift</label>
      </small>

      <button
        className="subtotal-proceed"
        onClick={handleProceedToCheckout}
        disabled={itemCount === 0}
      >
        Proceed to Checkout
      </button>
    </div>
  );
}