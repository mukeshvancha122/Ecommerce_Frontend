import React from "react";
import "./Subtotal.css";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { selectCartItems, selectCartTotal } from "../../features/cart/CartSlice";
import { selectUser } from "../../features/auth/AuthSlice";
import { formatCurrency } from "../../utils/currency";
import { useTranslation } from "../../i18n/TranslationProvider";

export default function Subtotal() {
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const user = useSelector(selectUser);
  const history = useHistory();
  const { t } = useTranslation();

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  const handleProceedToCheckout = () => {
    if (!user) {
      // Redirect to login with the checkout page as the return destination
      history.push({
        pathname: "/login",
        state: { from: "/proceed-to-checkout" }
      });
      return;
    }
    history.push("/proceed-to-checkout");
  };

  return (
    <div className="subtotal">
      <p>
        {t("cart.subtotal")} ({itemCount} {itemCount === 1 ? t("cart.items").slice(0, -1) : t("cart.items")}):{" "}
        <strong>{formatCurrency(total)}</strong>
      </p>

      <small className="subtotal-gift">
        <input type="checkbox" id="gift" />{" "}
        <label htmlFor="gift">{t("checkout.giftOption", {})}</label>
      </small>

      <button
        className="subtotal-proceed"
        onClick={handleProceedToCheckout}
        disabled={itemCount === 0}
      >
        {t("cart.checkout")}
      </button>
    </div>
  );
}