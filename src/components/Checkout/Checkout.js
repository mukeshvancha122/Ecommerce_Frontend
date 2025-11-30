import React from "react";
import "./Checkout.css";
import CheckoutProduct from "./CheckoutProduct";
import Subtotal from "./Subtotal";
import EmptyCartProducts from "./EmptyCartProducts";
import { useCart } from "../../hooks/useCart";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/auth/AuthSlice";
import { useTranslation } from "../../i18n/TranslationProvider";

const safeName = (user) =>
  (user?.name && user.name.trim()) ||
  (user?.email ? user.email : null);

export default function Checkout() {
  const { items } = useCart();
  const user = useSelector(selectUser);
  const { t } = useTranslation();

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
              ? `${t("header.accountHello")}, ${safeName(user)}`
              : `${t("header.accountHello")}, Guest`}
          </h3>

          <h2 className="checkout-title">{t("cart.title")}</h2>

          {items.length === 0 ? (
            <>
              <p>{t("cart.empty")}</p>
              <EmptyCartProducts />
            </>
          ) : (
            items.map((item) => (
              <CheckoutProduct
                key={`${item.sku}-${item.qty}-${item.id}`}
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
