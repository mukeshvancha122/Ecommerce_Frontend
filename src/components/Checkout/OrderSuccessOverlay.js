import React, { useEffect } from "react";
import "./OrderSuccessOverlay.css";
import { useTranslation } from "../../i18n/TranslationProvider";

export default function OrderSuccessOverlay({ orderId, onComplete }) {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="orderSuccessOverlay" role="alert">
      <div className="orderSuccessCard">
        <div className="orderSuccessIcon">✅</div>
        <h2>{t("checkout.successTitle")}</h2>
        <p>{t("checkout.successBody")}</p>
        {orderId && <p className="orderSuccessId">#{orderId}</p>}
      </div>
    </div>
  );
}

