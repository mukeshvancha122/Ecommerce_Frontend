import React, { useEffect, useMemo, useState } from "react";
import "./CheckoutPage.css";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAddresses, fetchShippingQuote, selectAddresses, selectSelectedAddressId,
  selectAddress as selectAddressAction, selectShipping, selectCheckoutStep, goToPayment,
  startPayment, selectPaymentState
} from "../../features/checkout/CheckoutSlice";
import { selectCartItems, selectCartTotal } from "../../features/cart/CartSlice";
import AddressBook from "../../components/Checkout/AddressBook";
import AddressModal from "../../components/Checkout/AddressModal";
import PaymentSection from "../../components/Checkout/PaymentSection";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const addresses = useSelector(selectAddresses);
  const selectedAddressId = useSelector(selectSelectedAddressId);
  const shipping = useSelector(selectShipping);
  const step = useSelector(selectCheckoutStep);
  const payment = useSelector(selectPaymentState);

  const items = useSelector(selectCartItems);
  const itemsTotal = useSelector(selectCartTotal);

  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    dispatch(fetchAddresses());
    dispatch(fetchShippingQuote());
  }, [dispatch]);

  const orderTotal = useMemo(
    () => itemsTotal + (shipping.shipping || 0) + (shipping.tax || 0) + (shipping.importCharges || 0),
    [itemsTotal, shipping]
  );

  const handleDeliverToThis = async () => {
    // move to payment
    await dispatch(startPayment({ addressId: selectedAddressId, items }));
    if (!payment.lastError) dispatch(goToPayment());
  };

  return (
    <main className="co">
      <div className="co-header">
        <div className="co-brand">yourshop</div>
        <div className="co-secure">Secure checkout ▾</div>
        <div className="co-cartIcon">🛒 Cart</div>
      </div>

      <section className="co-body">
        <div className="co-left">
          {/* Address section */}
          <div className="co-card">
            <div className="co-card-title">Select a delivery address</div>
            <AddressBook
              addresses={addresses}
              selectedId={selectedAddressId}
              onSelect={(id) => dispatch(selectAddressAction(id))}
              onAddNew={() => setShowAddressModal(true)}
              onChangeClick={() => setShowAddressModal(true)}
            />
            <button
              className="co-cta"
              disabled={!selectedAddressId || items.length === 0}
              onClick={handleDeliverToThis}
            >
              Deliver to this address
            </button>
          </div>

          {/* Payment method section (only after address selected) */}
          <div className="co-card">
            <div className="co-card-title">Payment method</div>
            {step !== "payment" ? (
              <div className="co-muted">
                Select an address and click <b>Deliver to this address</b> to continue.
              </div>
            ) : (
              <PaymentSection
                clientSecret={payment.clientSecret}
                orderTotal={orderTotal}
                addressId={selectedAddressId}
                items={items}
              />
            )}
          </div>
        </div>

        <aside className="co-right">
          <div className="co-summary">
            <button
              className="co-summary-cta"
              disabled={!selectedAddressId}
              onClick={handleDeliverToThis}
            >
              {step === "payment" ? "Use this payment method" : "Deliver to this address"}
            </button>

            <div className="co-summary-row"><span>Items:</span><b>${itemsTotal.toFixed(2)}</b></div>
            <div className="co-summary-row"><span>Shipping & handling:</span><b>${(shipping.shipping||0).toFixed(2)}</b></div>
            <div className="co-summary-row"><span>Estimated tax:</span><b>${(shipping.tax||0).toFixed(2)}</b></div>
            <div className="co-summary-row"><span>Import Charges:</span><b>${(shipping.importCharges||0).toFixed(2)}</b></div>
            <hr />
            <div className="co-summary-total"><span>Order total:</span><b>${orderTotal.toFixed(2)}</b></div>
          </div>
        </aside>
      </section>

      {/* Add / Change address modal */}
      <AddressModal open={showAddressModal} onClose={() => setShowAddressModal(false)} />
    </main>
  );
}