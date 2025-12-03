import React, { useEffect, useMemo, useState, useRef } from "react";
import "./CheckoutPage.css";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  fetchAddresses,
  fetchShippingQuote,
  updateOrderCheckoutThunk,
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
  selectCoupons,
  selectRewards,
  resetCheckout,
  selectIsLoadingCheckout,
  selectIsUpdatingCheckout,
  selectCheckoutError,
  selectCheckoutUpdated,
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
  const isLoadingCheckout = useSelector(selectIsLoadingCheckout);
  const isUpdatingCheckout = useSelector(selectIsUpdatingCheckout);
  const checkoutError = useSelector(selectCheckoutError);
  const checkoutUpdated = useSelector(selectCheckoutUpdated);
  const { items, total: itemsTotal, removeItem, updateItem } = useCart();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showCountryError, setShowCountryError] = useState(false);
  const [countryErrorData, setCountryErrorData] = useState({ selectedCountry: "", addressCountry: "" });
  const [localShippingType, setLocalShippingType] = useState(null);
  const selectedCountry = useSelector(selectCountry);
  const lastUpdateRef = useRef({ addressId: null, shippingType: null });

  // Call startCheckout when component mounts and items are available (convert cart to order)
  // This should be called when navigating from Cart to Checkout
  useEffect(() => {
    // Note: Order will be created/placed when updateOrderCheckout is called
    // No need to initialize checkout separately
  }, [dispatch, items.length, isLoadingCheckout]);

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

  const orderTotal = useMemo(
    () => itemsTotal + (shipping.shipping || 0) + (shipping.tax || 0) + (shipping.importCharges || 0),
    [itemsTotal, shipping]
  );

  // Handle shipping type selection
  const handleShippingTypeChange = (type) => {
    setLocalShippingType(type);
    dispatch(selectShippingType(type));
  };

  // Call updateOrderCheckout when both address and shipping type are selected
  useEffect(() => {
    const updateCheckout = async () => {
      // Only update if both are set, not currently updating, and values have changed
      const hasChanged = 
        selectedAddressId !== lastUpdateRef.current.addressId ||
        localShippingType !== lastUpdateRef.current.shippingType;
      
      // Check if address ID is a numeric backend ID (not a local storage ID)
      const isNumericId = selectedAddressId && /^\d+$/.test(String(selectedAddressId));
      
      if (selectedAddressId && localShippingType && !isUpdatingCheckout && hasChanged) {
        try {
          console.log("[CheckoutPage] Updating order checkout with address and shipping type");
          const result = await dispatch(updateOrderCheckoutThunk({
            shipping_address_id: selectedAddressId,
            shipping_type: localShippingType,
          })).unwrap();
          
          // If update was skipped (local address), still mark as processed
          if (result.skipped) {
            console.log("[CheckoutPage] Update skipped for local address - will be included in order creation");
          } else {
            console.log("[CheckoutPage] Order checkout updated successfully");
          }
          
          // Update ref to track last successful update (even if skipped)
          lastUpdateRef.current = {
            addressId: selectedAddressId,
            shippingType: localShippingType,
          };
        } catch (error) {
          console.error("[CheckoutPage] Failed to update order checkout:", error);
          // Don't block the flow - address will be included in final order creation
        }
      }
    };

    updateCheckout();
  }, [selectedAddressId, localShippingType, dispatch, isUpdatingCheckout]);

  const handleDeliverToThis = async () => {
    if (!selectedAddressId || items.length === 0) return;
    
    // Ensure shipping type is selected
    if (!localShippingType) {
      alert("Please select a shipping type (Normal or Express)");
      return;
    }

    // Ensure order is created and updated before proceeding
    // Call updateOrderCheckout - this will also ensure startCheckout is called first
    try {
      console.log("[CheckoutPage] Updating order checkout before proceeding to payment");
      const result = await dispatch(updateOrderCheckoutThunk({
        shipping_address_id: selectedAddressId,
        shipping_type: localShippingType,
      })).unwrap();
      
      // Check if update was skipped (for local storage addresses)
      if (result.skipped) {
        console.log("[CheckoutPage] Update skipped for local address - address will be included in order creation");
        // Still proceed - address data will be included in final order creation
      } else {
        // Verify we got a successful response (200/201) for backend addresses
        if (result.status !== 200 && result.status !== 201) {
          throw new Error(`Update checkout returned status ${result.status}`);
        }
        console.log("[CheckoutPage] Order checkout updated successfully with status:", result.status);
      }
      
      // Now proceed to payment (works for both backend and local addresses)
      await dispatch(startPayment({ addressId: selectedAddressId, items }));
      if (!payment.lastError) {
        dispatch(goToPayment());
      }
    } catch (error) {
      console.error("[CheckoutPage] Failed to update order checkout:", error);
      const errorMessage = error.message || error.response?.data?.message || "Failed to update order. Please try again.";
      alert(errorMessage);
      return;
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
              {checkoutError && !isLoadingCheckout && (
                <div className="co-error">
                  <p>Error: {checkoutError}</p>
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
                {isUpdatingCheckout ? "Updating..." : t("checkout.deliverCta")}
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
            <button
              className="co-summary-cta"
              disabled={!selectedAddressId || !localShippingType || items.length === 0 || isUpdatingCheckout || isLoadingCheckout}
              onClick={handleDeliverToThis}
            >
              {isUpdatingCheckout ? "Updating..." : step === "payment" ? t("checkout.usePaymentMethod") : t("checkout.deliverCta")}
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
