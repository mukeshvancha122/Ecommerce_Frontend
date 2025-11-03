import React from "react";
import { useStateValue } from "../../StateProvider";
import "./Checkout.css";
import CheckoutProduct from "./CheckoutProduct";
import Subtotal from "./Subtotal";

function Checkout() {
  const [{ cart, user }] = useStateValue();

  return (
    <div className="checkout">
      <div className="checkout-left">
        <img
          className="checkout-ad"
          src="https://images-na.ssl-images-amazon.com/images/G/02/UK_CCMP/TM/OCC_Amazon1._CB423492668_.jpg"
          alt="ad-banner"
        />

        <div>
          <h3>
            {user
              ? `Hello, ${user.name || user.email}`
              : "Hello, Guest"}
          </h3>

          <h2 className="checkout-title">Your shopping cart</h2>

          {cart.map((item) => (
            <CheckoutProduct
              key={item.id}          
              id={item.id}
              title={item.title}
              image={item.image}
              price={item.price}
              rating={item.rating}
              qty={item.qty}
            />
          ))}
        </div>
      </div>

      <div className="checkout-right">
        <Subtotal />
      </div>
    </div>
  );
}

export default Checkout;
