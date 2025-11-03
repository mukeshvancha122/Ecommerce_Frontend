import React, { useEffect, useState } from "react";
import "./CartPage.css";
import CartMainPanel from "../components/cart/CartMainPanel";
import CartPrimeBox from "../components/cart/CartPrimeBox";
import axios from "axios";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [savedForLater, setSavedForLater] = useState([]);

  // example: fetch cart contents
  useEffect(() => {
    axios
      .get("/api/cart", { withCredentials: true })
      .then((res) => {
        setCartItems(res.data.cartItems || []);
        setSavedForLater(res.data.savedForLater || []);
      })
      .catch(() => {
        setCartItems([]);
        setSavedForLater([]);
      });
  }, []);

  return (
    <main className="cartPage">
      <div className="cartPage-inner">
        <section className="cartPage-left">
          <CartMainPanel
            cartItems={cartItems}
            savedForLater={savedForLater}
          />
        </section>

        <aside className="cartPage-right">
          <CartPrimeBox />
        </aside>
      </div>
    </main>
  );
}
