import React, { useEffect, useMemo, useState } from "react";
import "./CheckoutPage.css";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  fetchAddresses,
  fetchShippingQuote,
  selectAddresses,
  selectSelectedAddressId,
  selectAddress as selectAddressAction,
  selectShipping,
  selectCheckoutStep,
  goToPayment,
  startPayment,
  selectPaymentState,
  resetCheckout,
} from "../../features/checkout/CheckoutSlice";
import { selectCartItems, selectCartTotal, clearCart } from "../../features/cart/CartSlice";
import AddressBook from "../../components/Checkout/AddressBook";
import AddressModal from "../../components/Checkout/AddressModal";
import PaymentSection from "../../components/Checkout/PaymentSection";
import OrderSuccessOverlay from "../../components/Checkout/OrderSuccessOverlay";
import CountryErrorModal from "../../components/Checkout/CountryErrorModal";
import { useTranslation } from "../../i18n/TranslationProvider";
import { selectCountry } from "../../features/country/countrySlice";
import { formatCurrency } from "../../utils/currency";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation();

  const addresses = useSelector(selectAddresses);
  const selectedAddressId = useSelector(selectSelectedAddressId);
  const shipping = useSelector(selectShipping);
  const step = useSelector(selectCheckoutStep);
  const payment = useSelector(selectPaymentState);
  const items = useSelector(selectCartItems);
  const itemsTotal = useSelector(selectCartTotal);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showCountryError, setShowCountryError] = useState(false);
  const [countryErrorData, setCountryErrorData] = useState({ selectedCountry: "", addressCountry: "" });
  const selectedCountry = useSelector(selectCountry);

  useEffect(() => {
    dispatch(fetchAddresses());
    dispatch(fetchShippingQuote());
  }, [dispatch]);

  useEffect(() => {
    if (items.length === 0) {
      history.replace("/checkout");
    }
  }, [items.length, history]);

  useEffect(() => {
    if (payment.status === "succeeded" && payment.orderId) {
      setShowSuccessOverlay(true);
      dispatch(clearCart());
    }
  }, [payment.status, payment.orderId, dispatch]);

  const orderTotal = useMemo(
    () => itemsTotal + (shipping.shipping || 0) + (shipping.tax || 0) + (shipping.importCharges || 0),
    [itemsTotal, shipping]
  );

  const handleDeliverToThis = async () => {
    if (!selectedAddressId || items.length === 0) return;
    await dispatch(startPayment({ addressId: selectedAddressId, items }));
    if (!payment.lastError) {
      dispatch(goToPayment());
    }
  };

  const handleOverlayComplete = () => {
    setShowSuccessOverlay(false);
    dispatch(resetCheckout());
    history.push("/orders");
  };

  return (
    <>
      <main className={`co ${showSuccessOverlay ? "co-blur" : ""}`}>
        <div className="co-header">
          <div className="co-brand">{t("brand")}</div>
          <div className="co-progress">
            <span className={step === "address" ? "active" : ""}>1. {t("checkout.selectAddress")}</span>
            <span className={step === "payment" ? "active" : ""}>2. {t("checkout.paymentMethod")}</span>
            <span className={step === "done" ? "active" : ""}>3. {t("checkout.reviewTitle")}</span>
          </div>
          <div className="co-secure">🔒 Secure checkout</div>
        </div>

        <section className="co-grid">
          <div className="co-main">
            <div className="co-card">
              <div className="co-card-title">{t("checkout.selectAddress")}</div>
              <AddressBook
                addresses={addresses}
                selectedId={selectedAddressId}
                onSelect={(id) => dispatch(selectAddressAction(id))}
                onAddNew={() => setShowAddressModal(true)}
                onChangeClick={() => setShowAddressModal(true)}
                onCountryMismatch={(selected, address) => {
                  setCountryErrorData({ selectedCountry: selected, addressCountry: address });
                  setShowCountryError(true);
                }}
              />
              <button
                className="co-cta"
                disabled={!selectedAddressId || items.length === 0}
                onClick={handleDeliverToThis}
              >
                {t("checkout.deliverCta")}
              </button>
            </div>

            <div className="co-card">
              <div className="co-card-title">{t("checkout.paymentMethod")}</div>
              {step !== "payment" ? (
                <div className="co-muted">{t("checkout.selectAddressFirst")}</div>
              ) : (
                <PaymentSection
                  clientSecret={payment.clientSecret}
                  orderTotal={orderTotal}
                  addressId={selectedAddressId}
                  items={items}
                  shipping={shipping}
                />
              )}
            </div>

            <div className="co-card">
              <div className="co-card-title">{t("checkout.reviewTitle")}</div>
              <div className="co-review-list">
                {items.map((item) => (
                  <div className="co-review-row" key={item.sku}>
                    <img src={item.image} alt={item.title} loading="lazy" />
                    <div>
                      <div className="co-review-title">{item.title}</div>
                      <div className="co-review-meta">
                        Qty: {item.qty} · ${(item.price * item.qty).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="co-summary">
            <button
              className="co-summary-cta"
              disabled={!selectedAddressId || items.length === 0}
              onClick={handleDeliverToThis}
            >
              {step === "payment" ? t("checkout.usePaymentMethod") : t("checkout.deliverCta")}
            </button>
            <div className="co-summary-row">
              <span>{t("checkout.items")}:</span>
              <b>{formatCurrency(itemsTotal)}</b>
            </div>
            <div className="co-summary-row">
              <span>{t("checkout.shipping")}:</span>
              <b>{formatCurrency(shipping.shipping || 0)}</b>
            </div>
            <div className="co-summary-row">
              <span>{t("checkout.tax")}:</span>
              <b>{formatCurrency(shipping.tax || 0)}</b>
            </div>
            <div className="co-summary-row">
              <span>{t("checkout.importCharges")}:</span>
              <b>{formatCurrency(shipping.importCharges || 0)}</b>
            </div>
            <hr />
            <div className="co-summary-total">
              <span>{t("checkout.total")}:</span>
              <b>{formatCurrency(orderTotal)}</b>
            </div>
          </aside>
        </section>
      </main>

      <AddressModal open={showAddressModal} onClose={() => setShowAddressModal(false)} />

      <CountryErrorModal
        isOpen={showCountryError}
        onClose={() => setShowCountryError(false)}
        selectedCountry={countryErrorData.selectedCountry}
        addressCountry={countryErrorData.addressCountry}
      />

      {showSuccessOverlay && (
        <OrderSuccessOverlay orderId={payment.orderId} onComplete={handleOverlayComplete} />
      )}
    </>
  );
}
