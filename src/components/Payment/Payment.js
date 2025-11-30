import React, { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/auth/AuthSlice";
import { useCart } from "../../hooks/useCart";
import API from "../../axios"; 
import "./Payment.css";

const Payment = () => {
  const history = useHistory();
  const user = useSelector(selectUser);
  const { items: cart } = useCart();

  // stripe hooks
  const stripe = useStripe();
  const elements = useElements();

  // local state
  const [clientSecret, setClientSecret] = useState("");
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState("");

  // billing/shipping fields
  const [billingName, setBillingName] = useState("");
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

  // Initialize billing name from user when available
  useEffect(() => {
    if (user?.name || user?.email) {
      setBillingName(user.name || user.email || "");
    }
  }, [user]);

  // --- 2. TOTAL CALC ---
  // total = sum(item.price * item.qty)
  const totalAmount = cart.reduce((acc, item) => {
    const itemTotal = Number(item.price || 0) * Number(item.qty || 1);
    return acc + itemTotal;
  }, 0);

  // Stripe expects amount in cents
  const totalAmountInCents = Math.round(totalAmount * 100);

  // --- 3. CREATE PAYMENT INTENT (GET clientSecret FROM BACKEND) ---
  // run every time total changes (user changes cart)
  useEffect(() => {
    const createPaymentIntent = async () => {
      // don't create an intent for $0
      if (!totalAmountInCents) {
        setClientSecret("");
        return;
      }

      try {
        const res = await API.post("/payments/create-intent", {
          amount: totalAmountInCents,
          currency: "usd",
        });

        setClientSecret(res.data.clientSecret);
      } catch (err) {
        console.error("Error creating payment intent:", err);
        setError(
          err?.response?.data?.message ||
            "Could not initialize payment. Please try again."
        );
      }
    };

    createPaymentIntent();
  }, [totalAmountInCents]);

  // --- 4. HANDLE CARD CHANGES (inline validation message from Stripe) ---
  const handleCardChange = (event) => {
    setError(event.error ? event.error.message : "");
  };

  // --- 5. SUBMIT PAYMENT ---
  // Flow:
  //   1. stripe.confirmCardPayment(clientSecret...)  <-- card details never hit our backend, good
  //   2. if success, call backend to save the order in DB
  //   3. show success & optionally redirect
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return; // Stripe not ready
    if (!clientSecret) {
      setError("Payment is not ready. Please refresh.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // confirm card with Stripe using clientSecret
      const cardElement = elements.getElement(CardElement);

      const { paymentIntent, error: stripeError } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: billingName,
              email: user?.email,
              address: {
                line1: addressLine1,
                city,
                state: stateRegion,
                postal_code: postalCode,
                country,
              },
            },
          },
        });

      if (stripeError) {
        console.error("Stripe error:", stripeError);
        setError(
          stripeError.message || "Payment failed. Please try again."
        );
        setProcessing(false);
        return;
      }

      // If we got here, Stripe thinks we're good
      setSucceeded(true);

      // --- 6. SAVE ORDER IN BACKEND ---
      // We're telling backend:
      //   - who ordered
      //   - what they ordered
      //   - how much
      //   - paymentIntent id so we can reconcile/refund later if needed
      try {
        await API.post("/orders", {
          email: user?.email,
          items: cart,
          amount: totalAmountInCents,
          currency: "usd",
          paymentIntentId: paymentIntent.id,
          shippingAddress: {
            name: billingName,
            line1: addressLine1,
            city,
            state: stateRegion,
            postalCode,
            country,
          },
        });
      } catch (dbErr) {
        console.error("Order save failed:", dbErr);
        // we don't block UX here because payment already succeeded.
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
              !stripe ||
              !elements ||
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
