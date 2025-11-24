import React from "react";
import "./Checkout.css";
import CheckoutProduct from "./CheckoutProduct";
import Subtotal from "./Subtotal";

// ✅ Redux
import { useSelector } from "react-redux";
import { selectCartItems } from "../../features/cart/CartSlice";
import { selectUser } from "../../features/auth/AuthSlice";
import { useTranslation } from "../../i18n/TranslationProvider";

const safeName = (user) =>
  (user?.name && user.name.trim()) ||
  (user?.email ? user.email : null);

export default function Checkout() {
  const items = useSelector(selectCartItems);
  const user = useSelector(selectUser);
  const { t } = useTranslation();

  return (
    <div className="checkout">
      <div className="checkout-left">
        <div className="checkout-ad">
          <div className="checkout-ad-content">
            <h3>HyderNexa Secure Checkout</h3>
            <p>Your payment information is protected with industry-leading security</p>
          </div>
        </div>

        <div>
          <h3>
            {user
              ? `${t("header.accountHello")}, ${safeName(user)}`
              : `${t("header.accountHello")}, Guest`}
          </h3>

          <h2 className="checkout-title">{t("cart.title")}</h2>

          {items.length === 0 ? (
            <p>{t("cart.empty")}</p>
          ) : (
            items.map((item) => (
              <CheckoutProduct
                key={item.sku}
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
