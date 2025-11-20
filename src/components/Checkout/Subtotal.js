import React from "react";
import "./Subtotal.css";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { selectCartItems, selectCartTotal } from "../../features/cart/CartSlice";
import { selectUser } from "../../features/auth/AuthSlice";
import { formatCurrency } from "../../utils/format";
import { useTranslation } from "../../i18n/TranslationProvider";

export default function Subtotal() {
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const user = useSelector(selectUser);
  const history = useHistory();
  const { t } = useTranslation();

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  const handleProceedToCheckout = () => {
    history.push("/proceed-to-checkout");
  };

  return (
    <div className="subtotal">
      <p>
        {t("cart.subtotal")} ({itemCount} {itemCount === 1 ? t("cart.items").slice(0, -1) : t("cart.items")}):{" "}
        <strong>{formatCurrency(total, "USD")}</strong>
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