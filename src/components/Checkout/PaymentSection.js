import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import "./PaymentSection.css";
import {
  CardElement,
  PaymentRequestButtonElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useDispatch } from "react-redux";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { confirmOrderThunk } from "../../features/checkout/CheckoutSlice";
import {
  fetchSavedCards,
  saveCard,
  simulatePhonePeCharge,
} from "../../api/payment/PaymentMethodsService";
import { useTranslation } from "../../i18n/TranslationProvider";
import { useSelector } from "react-redux";
import { selectCountry } from "../../features/country/countrySlice";
import { selectShipping, selectShippingTypeValue } from "../../features/checkout/CheckoutSlice";
import { formatCurrency } from "../../utils/currency";
import { processOrderPayment } from "../../api/payment/PaymentService";

const paymentOptionsConfig = (t) => [
  {
    id: "card",
    title: t("checkout.cardPayments") || "Card Payments",
    description: t("checkout.cardDesc") || "Pay with credit or debit card",
    badge: "Card",
  },
  {
    id: "upi",
    title: "UPI",
    description: "Pay with UPI (PhonePe, Google Pay, Paytm, etc.)",
    badge: "UPI",
  },
  {
    id: "cod",
    title: "Cash on Delivery",
    description: "Pay when you receive your order",
    badge: "COD",
  },
];

// Dummy payment bypass mode (for testing)
// Safely access process.env with fallback
const getEnvVar = (key, defaultValue) => {
  if (typeof window !== 'undefined' && window[key]) {
    return window[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return defaultValue;
};

const DUMMY_PAYMENT_MODE = getEnvVar('REACT_APP_DUMMY_PAYMENT', 'true') === "true" || true; // Set to true for bypass

const defaultPayPalClientId = getEnvVar('REACT_APP_PAYPAL_CLIENT_ID', 'test');

export default function PaymentSection({ clientSecret, orderTotal, addressId, items }) {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation();
  const selectedCountry = useSelector(selectCountry);
  const shippingType = useSelector(selectShippingTypeValue);

  const [selectedMethod, setSelectedMethod] = useState("card");
  const [cards, setCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardForm, setCardForm] = useState({
    holder: "",
    number: "",
    expMonth: "01",
    expYear: new Date().getFullYear().toString(),
    cvv: "",
  });
  const [cardFormError, setCardFormError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [phonePeVpa, setPhonePeVpa] = useState("");

  const paymentOptions = useMemo(() => paymentOptionsConfig(t), [t]);

  useEffect(() => {
    async function loadCards() {
      try {
        // Don't auto-fetch saved cards - user must add manually
        // const { data } = await fetchSavedCards();
        const data = { cards: [] }; // Empty array - no pre-filled cards
        setCards(data.cards || []);
      } catch (err) {
        console.error("Error loading cards:", err);
        setCards([]);
      } finally {
        setCardsLoading(false);
      }
    }
    loadCards();
  }, []);

  useEffect(() => {
    if (!stripe || !clientSecret) return;
    const currency = selectedCountry?.currency?.toLowerCase() || "usd";
    const pr = stripe.paymentRequest({
      country: selectedCountry?.code || "IN",
      currency: currency,
      total: { label: "HyderNexa", amount: Math.round(orderTotal * 100) },
      requestPayerName: true,
      requestPayerEmail: true,
    });
    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
      }
    });
  }, [stripe, clientSecret, orderTotal, selectedCountry]);

  const shipping = useSelector(selectShipping);

  const finalizeOrder = useCallback(
    async (paymentIntentId, method) => {
      const action = await dispatch(
        confirmOrderThunk({
          addressId,
          items,
          paymentIntentId,
          paymentMethod: method,
          total: orderTotal,
          shipping,
        })
      );
      if (confirmOrderThunk.rejected.match(action)) {
        throw new Error(action.error?.message || "Unable to confirm order");
      }
      return action.payload?.orderId;
    },
    [dispatch, addressId, items, orderTotal, shipping]
  );

  useEffect(() => {
    if (!paymentRequest || !stripe || !clientSecret) return;
    const handler = async (event) => {
      setProcessing(true);
      setError("");
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: event.paymentMethod.id,
      });
      if (stripeError) {
        event.complete("fail");
        setError(stripeError.message || "Payment failed");
        setProcessing(false);
        return;
      }
      event.complete("success");
      try {
        await finalizeOrder(paymentIntent.id, "googlePay");
      } catch (err) {
        setError(err.message);
      } finally {
        setProcessing(false);
      }
    };
    paymentRequest.on("paymentmethod", handler);
    return () => paymentRequest.off("paymentmethod", handler);
  }, [paymentRequest, stripe, clientSecret, finalizeOrder]);

  const handleConfirmCard = useCallback(async () => {
    // Dummy mode: skip validation and payment processing
    if (DUMMY_PAYMENT_MODE) {
      setProcessing(true);
      setError("");
      
      try {
        // Simulate payment delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create order (bypass actual payment)
        const orderId = await finalizeOrder("dummy_payment_intent_" + Date.now(), "card");
        
        if (!orderId) {
          throw new Error("Failed to create order");
        }

        // Dummy payment processing - call order-payment endpoint with dummy card data
        console.log("[PaymentSection] Dummy mode: Processing card payment via order-payment endpoint with dummy card data");
        try {
          await processOrderPayment({
            payment_method: "card", // Use "card" as payment method
            amount: String(orderTotal), // Total amount as string
            order_code: orderId, // Order code from order creation
            ref_code: `dummy_card_${Date.now()}`, // Dummy reference code
            pidx: "", // Optional payment ID (empty for dummy)
            // Include dummy card details for backend storage
            card_details: {
              number: cardForm.number || "4242424242424242", // Dummy card number
              holder: cardForm.holder || "Test User",
              expMonth: cardForm.expMonth || "12",
              expYear: cardForm.expYear || "2026",
              cvv: cardForm.cvv || "123", // Dummy CVV (safe to send in dummy mode)
            },
          });
          console.log("[PaymentSection] Dummy card payment processed successfully with card details stored");
        } catch (paymentErr) {
          console.warn("[PaymentSection] Dummy payment processing failed (non-blocking):", paymentErr);
          // Continue even if payment processing fails in dummy mode
        }
        
        console.log("[PaymentSection] Order created successfully with ID:", orderId);
        console.log("[PaymentSection] Cart will be cleared on order confirmation page");
        
        // Redirect to success page with order data in state
        // Cart will be cleared on the order confirmation page after order is confirmed
        history.push({
          pathname: "/order-confirmation",
          search: `?orderId=${orderId}`,
          state: {
            orderId,
            items: [...items], // Copy items array
            orderTotal,
            shipping: { ...shipping }, // Copy shipping object
            addressId,
            shippingType, // Include shipping type for update-checkout call
          }
        });
      } catch (err) {
        setError(err.message || "Payment failed. Please try again.");
        setProcessing(false);
      }
      return;
    }

    // Real payment mode
    if (!cardForm.number || !cardForm.expMonth || !cardForm.expYear || !cardForm.cvv) {
      setError("Please enter complete card details");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // First create order to get order_code
      const orderId = await finalizeOrder(null, "card");
      
      if (!orderId) {
        throw new Error("Failed to create order");
      }

      // Process payment using order-payment endpoint with card details
      console.log("[PaymentSection] Processing card payment via order-payment endpoint with card details...");
      await processOrderPayment({
        payment_method: "card", // Use "card" as payment method
        amount: String(orderTotal), // Total amount as string
        order_code: orderId, // Order code from order creation
        ref_code: `card_${Date.now()}`, // Reference code for card payment
        pidx: "", // Optional payment ID (empty for card)
        // Include card details for backend storage (last 4 digits only for security)
        card_details: {
          number: cardForm.number, // Will be masked to last 4 digits in API
          holder: cardForm.holder,
          expMonth: cardForm.expMonth,
          expYear: cardForm.expYear,
          // CVV is NOT sent for real payments (security)
        },
      });

      console.log("[PaymentSection] Card payment processed successfully with card details stored in backend");

      // Redirect to success page with order data in state
      history.push({
        pathname: "/order-confirmation",
        search: `?orderId=${orderId}`,
        state: {
          orderId,
          items,
          orderTotal,
          shipping,
          addressId,
        }
      });
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
      setProcessing(false);
    }
  }, [cardForm, orderTotal, finalizeOrder, history]);

  const handleUPI = async (e) => {
    e.preventDefault();
    
    // Dummy mode: skip validation and payment processing
    if (DUMMY_PAYMENT_MODE) {
      setProcessing(true);
      setError("");
      
      try {
        // Simulate payment delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create order (bypass actual payment)
        const orderId = await finalizeOrder("dummy_upi_payment_" + Date.now(), "upi");
        
        if (!orderId) {
          throw new Error("Failed to create order");
        }

        // Dummy payment processing - store payment in backend even in dummy mode
        console.log("[PaymentSection] Dummy mode: Processing UPI payment via order-payment endpoint with dummy data");
        try {
          await processOrderPayment({
            payment_method: "cod", // Map UPI to COD method
            amount: String(orderTotal),
            order_code: orderId,
            ref_code: `dummy_upi_${Date.now()}`,
            pidx: phonePeVpa || "dummy_upi_id", // Store UPI ID
          });
          console.log("[PaymentSection] Dummy UPI payment processed successfully");
        } catch (paymentErr) {
          console.warn("[PaymentSection] Dummy UPI payment processing failed (non-blocking):", paymentErr);
          // Continue even if payment processing fails in dummy mode
        }
        
        // Redirect to success page with order data in state
        history.push({
          pathname: "/order-confirmation",
          search: `?orderId=${orderId}`,
          state: {
            orderId,
            items: [...items], // Copy items array
            orderTotal,
            shipping: { ...shipping }, // Copy shipping object
            addressId,
            shippingType, // Include shipping type for update-checkout call
          }
        });
      } catch (err) {
        setError(err.message || "Payment failed. Please try again.");
        setProcessing(false);
      }
      return;
    }

    // Real payment mode
    if (!phonePeVpa) {
      setError("Please enter UPI ID");
      return;
    }

    setProcessing(true);
    setError("");
    try {
      // First create order to get order_code
      const orderId = await finalizeOrder(null, "upi");
      
      if (!orderId) {
        throw new Error("Failed to create order");
      }

      const { data } = await simulatePhonePeCharge({
        amount: Math.round(orderTotal * 100),
        vpa: phonePeVpa,
      });
      
      // Process UPI payment - store in backend
      // Map UPI to "cod" method if backend doesn't support "upi", or use "upi" if supported
      // Store UPI ID (VPA) in pidx field for reference
      console.log("[PaymentSection] Processing UPI payment via order-payment endpoint...");
      try {
        await processOrderPayment({
          payment_method: "cod", // Map UPI to COD method (backend may not have "upi" method)
          amount: String(orderTotal),
          order_code: String(orderId),
          ref_code: DUMMY_PAYMENT_MODE ? `dummy_upi_${Date.now()}` : `upi_${Date.now()}`,
          pidx: phonePeVpa, // Store UPI ID (VPA) in pidx field
        });
        console.log("[PaymentSection] UPI payment processed successfully");
      } catch (paymentErr) {
        // In dummy mode, log warning but continue (non-blocking)
        if (DUMMY_PAYMENT_MODE) {
          console.warn("[PaymentSection] Dummy UPI payment processing failed (non-blocking):", paymentErr);
        } else {
          console.warn("[PaymentSection] UPI payment processing failed (non-blocking):", paymentErr);
          // Continue even if payment storage fails - order is already created
        }
      }

      // Redirect to success page with order data in state
      history.push({
        pathname: "/order-confirmation",
        search: `?orderId=${orderId}`,
        state: {
          orderId,
          items: [...items], // Copy items array
          orderTotal,
          shipping: { ...shipping }, // Copy shipping object
          addressId,
          shippingType, // Include shipping type for update-checkout call
        }
      });
    } catch (err) {
      setError(err.message || "UPI payment failed.");
      setProcessing(false);
    }
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    if (!cardForm.holder || cardForm.number.length < 12 || !cardForm.cvv) {
      setCardFormError("Please fill the full card details.");
      return;
    }
    setCardFormError("");
    const { data } = await saveCard(cardForm);
    setCards((prev) => [...prev, data.card]);
    setShowCardModal(false);
    setCardForm({
      holder: "",
      number: "",
      expMonth: "01",
      expYear: new Date().getFullYear().toString(),
      cvv: "",
    });
  };

  const renderCardList = () => (
    <div className="ps-card-list">
      <div className="ps-card-list-header">
        <div>
          <h4>{t("payment.savedCards")}</h4>
          <p>{t("checkout.cardsSubtitle")}</p>
        </div>
        <button className="ps-link" type="button" onClick={() => setShowCardModal(true)}>
          + {t("checkout.addCard")}
        </button>
      </div>
      {cardsLoading ? (
        <div className="ps-muted">Loading cards…</div>
      ) : !cards || cards.length === 0 ? (
        <div className="ps-muted">{t("payment.noSavedCards")}</div>
      ) : (
        cards.map((card) => (
          <div className="ps-card" key={card.id}>
            <div>
              <div className="ps-card-title">
                {card.brand} · {t("payment.cardEnding")} {card.last4}
              </div>
              <div className="ps-card-meta">
                {card.holder} · {card.expMonth}/{card.expYear}
              </div>
            </div>
            {card.isDefault && <span className="ps-pill">{t("payment.default")}</span>}
          </div>
        ))
      )}
      {DUMMY_PAYMENT_MODE && (
        <div className="ps-muted" style={{ fontSize: "12px", marginBottom: "12px", color: "#666" }}>
          ⚠️ Dummy mode: Card details not required, payment will be bypassed
        </div>
      )}
      {!DUMMY_PAYMENT_MODE && (
        <div className="ps-stripe-element">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#111827",
                },
              },
            }}
          />
        </div>
      )}
      {DUMMY_PAYMENT_MODE && (
        <div className="ps-dummy-card-info" style={{ 
          padding: "12px", 
          backgroundColor: "#f0f9ff", 
          borderRadius: "8px", 
          marginBottom: "12px",
          fontSize: "14px",
          color: "#0369a1"
        }}>
          <strong>Test Card (for reference):</strong><br />
          Card: 4242 4242 4242 4242<br />
          Expiry: 12/25 | CVC: 123<br />
          <em>Note: In dummy mode, any values work - payment is bypassed</em>
        </div>
      )}
      <button className="ps-pay" onClick={handleConfirmCard} disabled={processing}>
        {processing ? "Processing…" : `Pay with Card (${formatCurrency(orderTotal)})`}
      </button>
    </div>
  );

  const renderGooglePay = () => (
    <div className="ps-wallet">
      {paymentRequest ? (
        <PaymentRequestButtonElement
          options={{ paymentRequest }}
          className="ps-wallet-button"
        />
      ) : (
        <div className="ps-muted">Google Pay is not available on this device.</div>
      )}
    </div>
  );

  const renderUPI = () => (
    <form className="ps-phonepe" onSubmit={handleUPI}>
      <label>
        UPI ID
        <input
          type="text"
          value={phonePeVpa}
          onChange={(e) => setPhonePeVpa(e.target.value)}
          placeholder="username@paytm or username@okaxis"
          required={!DUMMY_PAYMENT_MODE}
        />
      </label>
      {DUMMY_PAYMENT_MODE && (
        <div className="ps-muted" style={{ fontSize: "12px", marginTop: "8px", color: "#666" }}>
          ⚠️ Dummy mode: Payment will be bypassed
        </div>
      )}
      <button type="submit" className="ps-pay" disabled={processing}>
        {processing ? "Processing…" : `Pay with UPI (${formatCurrency(orderTotal)})`}
      </button>
    </form>
  );


  const handleCOD = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError("");

    try {
      // First create order to get order_code
      const orderId = await finalizeOrder(null, "cod");
      
      if (!orderId) {
        throw new Error("Failed to create order");
      }

      // Process COD payment - always store in backend (even in dummy mode)
      // This ensures payment details are recorded for order tracking
      console.log("[PaymentSection] Processing COD payment via order-payment endpoint...");
      try {
        await processOrderPayment({
          payment_method: "cod",
          amount: String(orderTotal),
          order_code: String(orderId),
          ref_code: DUMMY_PAYMENT_MODE ? `dummy_cod_${Date.now()}` : `cod_${Date.now()}`,
        });
        console.log("[PaymentSection] COD payment processed successfully");
      } catch (paymentErr) {
        // In dummy mode, log warning but continue (non-blocking)
        if (DUMMY_PAYMENT_MODE) {
          console.warn("[PaymentSection] Dummy COD payment processing failed (non-blocking):", paymentErr);
        } else {
          throw paymentErr; // In real mode, throw error
        }
      }

      // Redirect to success page with order data in state
      history.push({
        pathname: "/order-confirmation",
        search: `?orderId=${orderId}`,
        state: {
          orderId,
          items,
          orderTotal,
          shipping,
          addressId,
          shippingType, // Include shipping type for update-checkout call
        }
      });
    } catch (err) {
      setError(err.message || "Failed to place COD order. Please try again.");
      setProcessing(false);
    }
  };


  const renderCOD = () => (
    <div className="ps-cod">
      <div className="ps-muted">
        <p>You will pay cash when you receive your order.</p>
        <p>An additional charge may apply for COD orders.</p>
      </div>
      {DUMMY_PAYMENT_MODE && (
        <div className="ps-muted" style={{ fontSize: "12px", marginTop: "8px", color: "#666" }}>
          ⚠️ Dummy mode: Payment will be bypassed
        </div>
      )}
      <button className="ps-pay" onClick={handleCOD} disabled={processing}>
        {processing ? "Processing…" : `Place COD Order (${formatCurrency(orderTotal)})`}
      </button>
    </div>
  );

  const renderPayPal = () => (
    <div className="ps-paypal">
      <PayPalScriptProvider options={{ "client-id": defaultPayPalClientId, currency: selectedCountry?.currency || "USD" }}>
        <PayPalButtons
          disabled={processing}
          style={{ layout: "horizontal" }}
          createOrder={(data, actions) =>
            actions.order.create({
              purchase_units: [
                {
                  amount: { value: orderTotal.toFixed(2) },
                },
              ],
            })
          }
          onApprove={async (data, actions) => {
            // Redirect to order confirmation page instead of processing directly
            history.push("/order-confirmation");
          }}
          onError={(err) => {
            setError(err.message || "PayPal payment failed");
          }}
        />
      </PayPalScriptProvider>
    </div>
  );

  const renderSelectedMethod = () => {
    switch (selectedMethod) {
      case "card":
        return renderCardList();
      case "upi":
        return renderUPI();
      case "cod":
        return renderCOD();
      default:
        return null;
    }
  };

  return (
    <div className="ps">
      <div className="ps-methods">
        {paymentOptions.map((method) => (
          <button
            key={method.id}
            className={`ps-method ${selectedMethod === method.id ? "is-active" : ""}`}
            type="button"
            onClick={() => setSelectedMethod(method.id)}
          >
            <div>
              <div className="ps-method-title">{method.title}</div>
              <div className="ps-method-desc">{method.description}</div>
            </div>
            <span className="ps-pill">{method.badge}</span>
          </button>
        ))}
      </div>

      {error && <div className="ps-error">{error}</div>}

      {renderSelectedMethod()}

      {showCardModal && (
        <div className="ps-modal" role="dialog">
          <div className="ps-modal-card">
            <div className="ps-modal-header">
              <h3>{t("checkout.addCard")}</h3>
              <button type="button" onClick={() => setShowCardModal(false)}>
                ✕
              </button>
            </div>
            <form className="ps-modal-form" onSubmit={handleSaveCard}>
              <label>
                {t("payment.cardNumber")}
                <input
                  type="text"
                  value={cardForm.number}
                  onChange={(e) => setCardForm((prev) => ({ ...prev, number: e.target.value }))}
                  required
                />
              </label>
              <label>
                {t("payment.nameOnCard")}
                <input
                  type="text"
                  value={cardForm.holder}
                  onChange={(e) => setCardForm((prev) => ({ ...prev, holder: e.target.value }))}
                  required
                />
              </label>
              <div className="ps-modal-row">
                <label>
                  {t("payment.expirationDate")}
                  <div className="ps-modal-expiry">
                    <select
                      value={cardForm.expMonth}
                      onChange={(e) => setCardForm((prev) => ({ ...prev, expMonth: e.target.value }))}
                    >
                      {Array.from({ length: 12 }).map((_, idx) => {
                        const val = String(idx + 1).padStart(2, "0");
                        return (
                          <option key={val} value={val}>
                            {val}
                          </option>
                        );
                      })}
                    </select>
                    <select
                      value={cardForm.expYear}
                      onChange={(e) => setCardForm((prev) => ({ ...prev, expYear: e.target.value }))}
                    >
                      {Array.from({ length: 12 }).map((_, idx) => {
                        const year = new Date().getFullYear() + idx;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </label>
                <label>
                  {t("payment.securityCode")}
                  <input
                    type="password"
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm((prev) => ({ ...prev, cvv: e.target.value }))}
                    maxLength={4}
                    required
                  />
                </label>
              </div>
              {cardFormError && <div className="ps-error">{cardFormError}</div>}
              <div className="ps-modal-actions">
                <button type="button" className="ps-link" onClick={() => setShowCardModal(false)}>
                  {t("payment.cancel")}
                </button>
                <button type="submit" className="ps-pay">
                  {t("payment.saveCard")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
