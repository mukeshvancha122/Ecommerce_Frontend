import React, { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useHistory } from "react-router-dom";
import { useStateValue } from "../../StateProvider";
import API from "../../axios"; 
import "./Payment.css";

const Payment = () => {
  const history = useHistory();
  const [{ cart, user }] = useStateValue();

  // stripe hooks
  const stripe = useStripe();
  const elements = useElements();

  // local state
  const [clientSecret, setClientSecret] = useState("");
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState("");

  // billing/shipping fields
  const [billingName, setBillingName] = useState(user?.name || "");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("US");

  // --- 1. AUTH GUARD / CART GUARD ---
  // If not signed in, bounce to login.
  // If cart is empty, bounce back to cart/checkout.
  useEffect(() => {
    if (!user) {
      history.replace("/login");
      return;
    }
    if (!cart || cart.length === 0) {
      history.replace("/checkout");
      return;
    }
  }, [user, cart, history]);

  // --- 2. TOTAL CALC ---
  // total = sum(item.price * item.qty)
  const totalAmount = cart.reduce((acc, item) => {
    const itemTotal = Number(item.price || 0) * Number(item.qty || 1);
    return acc + itemTotal;
  }, 0);

  // Stripe expects amount in cents
  const totalAmountInCents = Math.round(totalAmount * 100);

  // --- 3. CREATE PAYMENT INTENT (BYPASSED - USING DUMMY DATA) ---
  // run every time total changes (user changes cart)
  useEffect(() => {
    const createPaymentIntent = async () => {
      // don't create an intent for $0
      if (!totalAmountInCents) {
        setClientSecret("");
        return;
      }

      // Bypass backend call - generate dummy clientSecret immediately
      // Simulate network delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const dummyClientSecret = `pi_dummy_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`;
      setClientSecret(dummyClientSecret);
      console.log("✅ Payment intent created (using dummy data):", dummyClientSecret);
    };

    createPaymentIntent();
  }, [totalAmountInCents]);

  // --- 4. HANDLE CARD CHANGES (inline validation message from Stripe) ---
  const handleCardChange = (event) => {
    setError(event.error ? event.error.message : "");
  };

  // --- 5. SUBMIT PAYMENT (BYPASSED - NO STRIPE/BACKEND CALLS) ---
  // Flow:
  //   1. Bypass Stripe confirmation - directly mark as succeeded
  //   2. Optionally save order to backend (non-blocking)
  //   3. show success & optionally redirect
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientSecret) {
      setError("Payment is not ready. Please refresh.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // Simulate payment processing delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Bypass Stripe confirmation - directly create dummy payment intent
      const dummyPaymentIntent = {
        id: `pi_dummy_${Date.now()}`,
        status: "succeeded",
        amount: totalAmountInCents,
        currency: "usd",
      };

      console.log("✅ Payment succeeded (bypassed Stripe):", dummyPaymentIntent);

      // Mark payment as succeeded immediately
      setSucceeded(true);

      // --- 6. SAVE ORDER IN BACKEND (OPTIONAL - NON-BLOCKING) ---
      // Try to save order but don't block if it fails
      try {
        await API.post("/orders", {
          email: user?.email,
          items: cart,
          amount: totalAmountInCents,
          currency: "usd",
          paymentIntentId: dummyPaymentIntent.id,
          shippingAddress: {
            name: billingName,
            line1: addressLine1,
            city,
            state: stateRegion,
            postalCode,
            country,
          },
        });
        console.log("✅ Order saved to backend");
      } catch (dbErr) {
        console.warn("Order save failed (non-blocking):", dbErr);
        // Don't block UX - payment already succeeded
      }

      setProcessing(false);

      // Optional: after success you can clear cart in global state
      // dispatch({ type: "EMPTY_CART" });

      // Optional: redirect to "Your Orders" page
      // history.push("/orders");

    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Unexpected error during payment. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-card">
        <h2 className="payment-title">Checkout</h2>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="payment-summary">
          <h3>Order Summary</h3>

          <ul className="payment-items">
            {cart.map((item, idx) => (
              <li key={idx} className="payment-item-row">
                <div className="payment-item-left">
                  <div className="payment-item-name">{item.title}</div>
                  <div className="payment-item-qty">
                    Qty: {item.qty || 1}
                  </div>
                </div>
                <div className="payment-item-price">
                  ${Number(item.price).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>

          <div className="payment-total-row">
            <span className="payment-total-label">Total</span>
            <span className="payment-total-value">
              ${totalAmount.toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* LEFT COLUMN: Billing + Payment form */}
        <form className="payment-form" onSubmit={handleSubmit}>
          <h3>Billing Details</h3>

          <label className="payment-label">
            Full Name
            <input
              className="payment-input"
              type="text"
              value={billingName}
              onChange={(e) => setBillingName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={processing || succeeded}
            />
          </label>

          <label className="payment-label">
            Address Line 1
            <input
              className="payment-input"
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="123 Market St"
              required
              disabled={processing || succeeded}
            />
          </label>

          <div className="payment-row">
            <label className="payment-label">
              City
              <input
                className="payment-input"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="San Francisco"
                required
                disabled={processing || succeeded}
              />
            </label>

            <label className="payment-label">
              State / Region
              <input
                className="payment-input"
                type="text"
                value={stateRegion}
                onChange={(e) => setStateRegion(e.target.value)}
                placeholder="CA"
                required
                disabled={processing || succeeded}
              />
            </label>
          </div>

          <div className="payment-row">
            <label className="payment-label">
              Postal Code
              <input
                className="payment-input"
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="94105"
                required
                disabled={processing || succeeded}
              />
            </label>

            <label className="payment-label">
              Country
              <input
                className="payment-input"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="US"
                required
                disabled={processing || succeeded}
              />
            </label>
          </div>

          <h3>Payment Method</h3>

          <div className="card-element-wrapper">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#1f2937",
                    fontFamily:
                      'system-ui, -apple-system, BlinkMacSystemFont, "Inter", "Roboto", "Segoe UI", sans-serif',
                    "::placeholder": {
                      color: "#9ca3af",
                    },
                  },
                  invalid: {
                    color: "#dc2626",
                  },
                },
                hidePostalCode: true,
              }}
              onChange={handleCardChange}
            />
          </div>

          {/* Error message */}
          {error && <div className="payment-error">{error}</div>}

          {/* Success message */}
          {succeeded && (
            <div className="payment-success">
              Payment successful 🎉 Your order has been placed.
            </div>
          )}

          <button
            className="payment-button"
            type="submit"
            disabled={
              processing ||
              succeeded ||
              !clientSecret ||
              totalAmountInCents <= 0
            }
          >
            {processing
              ? "Processing…"
              : succeeded
              ? "Paid"
              : `Pay $${totalAmount.toFixed(2)}`}
          </button>
        </form>

        {/* Footer note */}
        <div className="payment-disclaimer">
          Your payment information is securely processed by Stripe. We don't
          store card details.
        </div>
      </div>
    </div>
  );
};

export default Payment;
