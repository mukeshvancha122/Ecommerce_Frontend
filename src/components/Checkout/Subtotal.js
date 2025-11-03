import React from "react";
import { useHistory } from "react-router-dom";
import { useStateValue } from "../../StateProvider";
import { getBasketTotal } from "../../reducer";
import "./Subtotal.css";

function Subtotal() {
  const history = useHistory();
  const [{ cart, user }] = useStateValue();

  const handleCheckout = () => {
    if (!user) {
      // not signed in -> go login first
      history.push("/login");
      return;
    }

    // signed in -> continue to payment page
    history.push("/payment");
  };

  return (
    <div className="subtotal">
      <div className="subtotal-row">
        <span className="subtotal-row-label">
          Subtotal ({cart.length} {cart.length === 1 ? "item" : "items"})
        </span>
        <span className="subtotal-row-value">
          ${getBasketTotal(cart).toFixed(2)}
        </span>
      </div>

      <div className="subtotal-divider" />

      <div className="subtotal-gift">
        <input type="checkbox" />
        <span>This order contains a gift</span>
      </div>

      <button onClick={handleCheckout}>
        {user ? "Proceed to Checkout" : "Sign in to Checkout"}
      </button>
    </div>
  );
}

export default Subtotal;
