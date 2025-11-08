import React, { useCallback, useState } from "react";
import "./PaymentSection.css";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useDispatch } from "react-redux";
import { confirmOrderThunk } from "../../features/checkout/CheckoutSlice";

export default function PaymentSection({ clientSecret, orderTotal, addressId, items }) {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handlePay = useCallback(async () => {
    if (!stripe || !elements || !clientSecret) return;
    setBusy(true);
    setError("");

    const card = elements.getElement(CardElement);
    const { error: stripeErr, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (stripeErr) {
      setError(stripeErr.message || "Payment failed");
      setBusy(false);
      return;
    }

    // tell backend to place order
    await dispatch(
      confirmOrderThunk({
        addressId,
        items,
        paymentIntentId: paymentIntent.id,
      })
    );

    setBusy(false);
    // optionally redirect to "order placed" page
    // window.location.href = `/orders/${paymentIntent.id}`;
  }, [stripe, elements, clientSecret, dispatch, addressId, items]);

  return (
    <div className="ps">
      <div className="ps-row">
        <CardElement options={{ style: { base: { fontSize: "16px" }}}} />
      </div>

      {error && <div className="ps-error">{error}</div>}

      <button className="ps-pay" onClick={handlePay} disabled={!stripe || busy}>
        {busy ? "Processing..." : `Use this payment method ($${orderTotal.toFixed(2)})`}
      </button>
    </div>
  );
}
