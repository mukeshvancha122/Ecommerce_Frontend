import React from "react";
import "./Checkout.css";
import CheckoutProduct from "./CheckoutProduct";
import Subtotal from "./Subtotal";

// ✅ Redux
import { useSelector } from "react-redux";
import { selectCartItems } from "../../features/cart/CartSlice"; // adjust path/case to your file
import { selectUser } from "../../features/auth/AuthSlice";

const safeName = (user) =>
  (user?.name && user.name.trim()) ||
  (user?.email ? user.email : null);

export default function Checkout() {
  const items = useSelector(selectCartItems);
  const user = useSelector(selectUser);

  return (
    <div className="checkout">
      <div className="checkout-left">
        <img
          className="checkout-ad"
          src="https://images-na.ssl-images-amazon.com/images/G/02/UK_CCMP/TM/OCC_Amazon1._CB423492668_.jpg"
          alt="ad-banner"
        />

        <div>
          <h3>{user ? `Hello, ${safeName(user)}` : "Hello, Guest"}</h3>

          <h2 className="checkout-title">Your shopping cart</h2>

          {items.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <CheckoutProduct
                key={item.sku}          // sku is stable identifier
                id={item.sku}
                title={item.title}
                image={item.image}
                price={item.price}
                rating={item.rating}
                qty={item.qty}
              />
            ))
          )}
        </div>
      </div>

      <div className="checkout-right">
        <Subtotal />
      </div>
    </div>
  );
}
