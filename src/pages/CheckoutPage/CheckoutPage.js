import React, { useEffect, useMemo, useState } from "react";
import "./CheckoutPage.css";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  fetchAddresses,
  fetchShippingQuote,
  updateOrderCheckoutThunk,
  createStartCheckoutThunk,
  selectAddresses,
  selectSelectedAddressId,
  selectAddress as selectAddressAction,
  selectShipping,
  selectShippingTypeValue,
  selectShippingType,
  selectCheckoutStep,
  goToPayment,
  startPayment,
  selectPaymentState,
  resetCheckout,
  selectIsUpdatingCheckout,
  selectIsLoadingCheckout,
  selectCheckoutError,
  selectCheckoutUpdated,
  selectHasStartedCheckout,
  selectStartCheckoutSignature,
} from "../../features/checkout/CheckoutSlice";
import { useCart } from "../../hooks/useCart";
import { selectUser } from "../../features/auth/AuthSlice";
import AddressBook from "../../components/Checkout/AddressBook";
import AddressModal from "../../components/Checkout/AddressModal";
import PaymentSection from "../../components/Checkout/PaymentSection";
import OrderSuccessOverlay from "../../components/Checkout/OrderSuccessOverlay";
import CountryErrorModal from "../../components/Checkout/CountryErrorModal";
import { useTranslation } from "../../i18n/TranslationProvider";
import { selectCountry } from "../../features/country/countrySlice";
import { formatCurrency } from "../../utils/currency";
import { getImageUrl } from "../../utils/imageUtils";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation();

  const user = useSelector(selectUser);
  const addresses = useSelector(selectAddresses);
  const selectedAddressId = useSelector(selectSelectedAddressId);
  const shipping = useSelector(selectShipping);
  const shippingType = useSelector(selectShippingTypeValue);
  const step = useSelector(selectCheckoutStep);
  const payment = useSelector(selectPaymentState);
  const isUpdatingCheckout = useSelector(selectIsUpdatingCheckout);
  const isLoadingCheckout = useSelector(selectIsLoadingCheckout);
  const checkoutError = useSelector(selectCheckoutError);
  const checkoutUpdated = useSelector(selectCheckoutUpdated);
  const hasStartedCheckout = useSelector(selectHasStartedCheckout);
  const lastStartCheckoutSignature = useSelector(selectStartCheckoutSignature);
  const { items, total: itemsTotal, removeItem, updateItem } = useCart();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showCountryError, setShowCountryError] = useState(false);
  const [countryErrorData, setCountryErrorData] = useState({ selectedCountry: "", addressCountry: "" });
  const [localShippingType, setLocalShippingType] = useState(null);
  const selectedCountry = useSelector(selectCountry);
  const cartSignature = useMemo(() => {
    if (!items || items.length === 0) {
      return null;
    }
    return items
      .map((item) => `${item.sku || item.id || item.title}:${item.qty}`)
      .sort()
      .join("|");
  }, [items]);

  const hasStartedCurrentOrder = hasStartedCheckout && !!cartSignature && lastStartCheckoutSignature === cartSignature;

  // STEP 1: Create order from cart when checkout page loads
  useEffect(() => {
    const initializeOrder = async () => {
      if (!cartSignature) {
        return;
      }
      if (hasStartedCurrentOrder || isLoadingCheckout) {
        return;
      }
      console.log("[CheckoutPage] STEP 1: Creating order from cart...");
      try {
        await dispatch(createStartCheckoutThunk(cartSignature)).unwrap();
        console.log("[CheckoutPage] STEP 1: Order created successfully");
      } catch (error) {
        console.error("[CheckoutPage] STEP 1: Failed to create order:", error);
      }
    };

    initializeOrder();
  }, [dispatch, cartSignature, hasStartedCurrentOrder, isLoadingCheckout]);

  // Load addresses when user is logged in
  useEffect(() => {
    if (user?.email) {
      dispatch(fetchAddresses());
    }
  }, [dispatch, user?.email]);

  useEffect(() => {
    // Recalculate shipping when items or address change
    if (items.length > 0 && selectedAddressId) {
      // Get address data to pass to shipping quote
      const address = addresses.find(addr => addr.id === selectedAddressId);
      const addressData = address?.backendFormat || null;
      dispatch(fetchShippingQuote(addressData));
    }
  }, [dispatch, items, selectedAddressId, addresses]);

  useEffect(() => {
    if (items.length === 0) {
      history.replace("/checkout");
    }
  }, [items.length, history]);

  // Only show success overlay if payment succeeded AND order was confirmed
  // Don't clear cart here - let OrderConfirmationPage handle it after order is confirmed
  useEffect(() => {
    // This effect is kept for backward compatibility but cart clearing is handled in OrderConfirmationPage
    // Only redirect happens here if needed
  }, [payment.status, payment.orderId, dispatch]);

  const orderTotal = useMemo(() => {
    const items = parseFloat(itemsTotal) || 0;
    const shippingCost = parseFloat(shipping.shipping) || 0;
    const taxCost = parseFloat(shipping.tax) || 0;
    const importChargesCost = parseFloat(shipping.importCharges) || 0;
    const total = items + shippingCost + taxCost + importChargesCost;
    
    console.log("[CheckoutPage] Order Total Calculation:", {
      items,
      shippingCost,
      taxCost,
      importChargesCost,
      total,
    });
    
    return total;
  }, [itemsTotal, shipping.shipping, shipping.tax, shipping.importCharges]);

  // Handle shipping type selection
  const handleShippingTypeChange = (type) => {
    setLocalShippingType(type);
    dispatch(selectShippingType(type));
  };

  // STEP 2: Update order with address when user clicks "Deliver to this address"
  // This happens BEFORE payment step
  const handleDeliverToThis = async () => {
    if (!selectedAddressId || items.length === 0) return;
    
    // Prevent multiple clicks while update is in progress
    if (isUpdatingCheckout) {
      console.log("[CheckoutPage] Update already in progress, please wait...");
      return;
    }
    
    // Ensure shipping type is selected
    if (!localShippingType) {
      alert("Please select a shipping type (Normal or Express)");
      return;
    }

    if (!hasStartedCurrentOrder) {
      if (isLoadingCheckout) {
        alert("Please wait while we prepare your checkout...");
        return;
      }
      if (!cartSignature) {
        alert("No items available to checkout.");
        return;
      }
      try {
        await dispatch(createStartCheckoutThunk(cartSignature)).unwrap();
      } catch (error) {
        console.error("[CheckoutPage] STEP 1 (retry) failed:", error);
        alert("Unable to start checkout. Please try again.");
        return;
      }
    }

    try {
      console.log("[CheckoutPage] STEP 2: Updating order with address ID:", selectedAddressId);
      const result = await dispatch(updateOrderCheckoutThunk({
        shipping_address_id: selectedAddressId,
        shipping_type: localShippingType,
      })).unwrap();
      
      // Check if update was skipped (for local storage addresses)
      if (result.skipped) {
        console.log("[CheckoutPage] Update skipped for local address");
        alert("Please use a saved address from the backend");
        return;
      }
      
      // Verify we got a successful response (200/201)
      if (result.status !== 200 && result.status !== 201) {
        throw new Error(`Order update failed with status ${result.status}`);
      }
      
      console.log("[CheckoutPage] STEP 2: Order updated successfully");
      
      // Now proceed to payment step
      await dispatch(startPayment({ addressId: selectedAddressId, items }));
      if (!payment.lastError) {
        dispatch(goToPayment());
      }
    } catch (error) {
      console.error("[CheckoutPage] STEP 2: Failed to update order:", error);
      const errorMessage = error.message || error.response?.data?.message || "Failed to update order. Please try again.";
      alert(errorMessage);
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
              
              {/* Loading state for startCheckout */}
              {isLoadingCheckout && (
                <div className="co-loading">
                  <p>Starting checkout...</p>
                </div>
              )}

              {/* Error state for startCheckout */}
              {checkoutError && !isUpdatingCheckout && !isLoadingCheckout && (
                <div className="co-error">
                  <p>Error: {checkoutError}</p>
                </div>
              )}

              {/* Show loading state while fetching addresses */}
              {addresses.length === 0 && user?.email && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  Loading addresses...
                </div>
              )}
              
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

              {/* Shipping Type Selection */}
              {selectedAddressId && (
                <div className="co-shipping-type" style={{ marginTop: "20px", marginBottom: "20px" }}>
                  <div className="co-card-title" style={{ fontSize: "16px", marginBottom: "10px" }}>
                    Select Shipping Type
                  </div>
                  <div style={{ display: "flex", gap: "15px" }}>
                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="shippingType"
                        value="Normal"
                        checked={localShippingType === "Normal"}
                        onChange={() => handleShippingTypeChange("Normal")}
                        style={{ marginRight: "8px" }}
                      />
                      <span>Normal</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="shippingType"
                        value="Express"
                        checked={localShippingType === "Express"}
                        onChange={() => handleShippingTypeChange("Express")}
                        style={{ marginRight: "8px" }}
                      />
                      <span>Express</span>
                    </label>
                  </div>
                  {isUpdatingCheckout && (
                    <div style={{ marginTop: "10px", color: "#666", fontSize: "14px" }}>
                      Updating order...
                    </div>
                  )}
                </div>
              )}

              <button
                className="co-cta"
                disabled={!selectedAddressId || !localShippingType || items.length === 0 || isUpdatingCheckout || isLoadingCheckout}
                onClick={handleDeliverToThis}
              >
                {isLoadingCheckout ? "Starting checkout..." : isUpdatingCheckout ? "Updating..." : t("checkout.deliverCta")}
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
                  shippingType={localShippingType}
                  items={items}
                />
              )}
            </div>

            <div className="co-card">
              <div className="co-card-title">{t("checkout.reviewTitle")}</div>
              <div className="co-review-list">
                {items.map((item) => (
                  <div className="co-review-row" key={item.sku}>
                    <img 
                      src={getImageUrl(item.image)} 
                      alt={item.title} 
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "/images/NO_IMG.png";
                      }}
                    />
                    <div className="co-review-content">
                      <div className="co-review-title">{item.title}</div>
                      <div className="co-review-meta">
                        <label className="co-review-qty">
                          Qty:{" "}
                          <select 
                            value={item.qty} 
                            onChange={(e) => {
                              try {
                                updateItem(item.sku, Number(e.target.value));
                              } catch (error) {
                                console.error("Failed to update quantity:", error);
                              }
                            }}
                            aria-label="Quantity"
                          >
                            {Array.from({ length: 99 }, (_, i) => i + 1).map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </label>
                        <span className="co-review-price">
                          {formatCurrency(item.price * item.qty)}
                        </span>
                      </div>
                      <button 
                        className="co-review-remove"
                        onClick={async () => {
                          try {
                            await removeItem(item.sku);
                          } catch (error) {
                            console.error("Failed to remove item:", error);
                          }
                        }}
                        aria-label="Remove item"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="co-review-empty">
                    No items in cart. <a href="/">Continue shopping</a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="co-summary">
            {/* Delivery Address Display */}
            {selectedAddressId && (() => {
              const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
              return selectedAddress ? (
                <div className="co-delivery-address">
                  <div className="co-delivery-address-title">Delivery Address</div>
                  <div className="co-delivery-address-content">
                    <div className="co-delivery-address-name">{selectedAddress.fullName}</div>
                    <div className="co-delivery-address-line">{selectedAddress.address1}</div>
                    {selectedAddress.address2 && (
                      <div className="co-delivery-address-line">{selectedAddress.address2}</div>
                    )}
                    <div className="co-delivery-address-line">
                      {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}
                    </div>
                    <div className="co-delivery-address-line">{selectedAddress.country}</div>
                    <div className="co-delivery-address-phone">Phone: {selectedAddress.phone}</div>
                  </div>
                </div>
              ) : null;
            })()}
            
            <button
              className="co-summary-cta"
              disabled={!selectedAddressId || !localShippingType || items.length === 0 || isUpdatingCheckout || isLoadingCheckout}
              onClick={handleDeliverToThis}
            >
              {isLoadingCheckout ? "Starting checkout..." : isUpdatingCheckout ? "Updating..." : step === "payment" ? t("checkout.usePaymentMethod") : t("checkout.deliverCta")}
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
