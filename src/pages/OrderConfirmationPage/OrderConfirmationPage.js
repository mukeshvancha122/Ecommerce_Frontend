import React, { useMemo, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./OrderConfirmationPage.css";
import { selectCartItems, selectCartTotal, clearCart } from "../../features/cart/CartSlice";
import { selectSelectedAddressId, selectAddresses, selectShipping } from "../../features/checkout/CheckoutSlice";
import { confirmOrderThunk } from "../../features/checkout/CheckoutSlice";
import { formatCurrency } from "../../utils/currency";
import { getImageUrl } from "../../utils/imageUtils";
import { selectCountry } from "../../features/country/countrySlice";
import { downloadReceiptPDF } from "../../utils/receiptGenerator";

export default function OrderConfirmationPage() {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const items = useSelector(selectCartItems);
  const itemsTotal = useSelector(selectCartTotal);
  const shipping = useSelector(selectShipping);
  const selectedAddressId = useSelector(selectSelectedAddressId);
  const addresses = useSelector(selectAddresses);
  const selectedCountry = useSelector(selectCountry);
  
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [downloadingReceipt, setDownloadingReceipt] = React.useState(false);
  const [orderConfirmed, setOrderConfirmed] = React.useState(false);
  const [confirmedOrderData, setConfirmedOrderData] = React.useState(null);
  const [orderIdFromUrl, setOrderIdFromUrl] = React.useState(null);
  const isMountedRef = React.useRef(true);
  const processedOrderIdRef = React.useRef(null);

  // Get orderId from URL or location state if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get("orderId");
    const locationState = location.state;
    
    // Only process if we have an orderId and haven't processed it yet
    if (orderId && processedOrderIdRef.current !== orderId) {
      processedOrderIdRef.current = orderId;
      setOrderIdFromUrl(orderId);
      
      // Use items from location state if available (preserved from payment), otherwise use cart
      const orderItems = locationState?.items || items;
      const orderTotalFromState = locationState?.orderTotal || (itemsTotal + (shipping.shipping || 0) + (shipping.tax || 0) + (shipping.importCharges || 0));
      const shippingFromState = locationState?.shipping || shipping;
      const addressIdFromState = locationState?.addressId || selectedAddressId;
      
      // If orderId exists, it means order was already created via payment
      // Mark as confirmed and create order data
      if (orderItems && orderItems.length > 0) {
        const orderData = {
          order_code: orderId,
          orderId: orderId,
          order_date: new Date().toISOString(),
          placedAt: new Date().toISOString(),
          items: orderItems,
          itemsTotal: orderItems.reduce((sum, item) => sum + (item.price * item.qty), 0),
          total: orderTotalFromState,
          shipping: shippingFromState,
          selectedAddress: addresses.find(addr => addr.id === addressIdFromState),
        };
        setConfirmedOrderData(orderData);
        setOrderConfirmed(true);
        // Clear cart after showing confirmation
        dispatch(clearCart());
      } else if (items.length > 0) {
        // Fallback to current cart items if location state not available
        const orderData = {
          order_code: orderId,
          orderId: orderId,
          order_date: new Date().toISOString(),
          placedAt: new Date().toISOString(),
          items: items,
          itemsTotal: itemsTotal,
          total: itemsTotal + (shipping.shipping || 0) + (shipping.tax || 0) + (shipping.importCharges || 0),
          shipping: shipping,
          selectedAddress: addresses.find(addr => addr.id === selectedAddressId),
        };
        setConfirmedOrderData(orderData);
        setOrderConfirmed(true);
        // Clear cart after showing confirmation
        dispatch(clearCart());
      }
    }
  }, [location.search, location.state]);
  
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const selectedAddress = useMemo(() => {
    if (!selectedAddressId || !addresses.length) return null;
    return addresses.find((addr) => addr.id === selectedAddressId);
  }, [selectedAddressId, addresses]);

  const orderTotal = useMemo(
    () => itemsTotal + (shipping.shipping || 0) + (shipping.tax || 0) + (shipping.importCharges || 0),
    [itemsTotal, shipping]
  );

  // Calculate estimated delivery date (2-4 days from now)
  const estimatedDelivery = useMemo(() => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days from now
    return deliveryDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const formatErrorMessage = (error) => {
    // Convert technical errors to user-friendly messages
    if (!error) return "Something went wrong. Please try again.";
    
    const errorStr = String(error).toLowerCase();
    
    // Network errors
    if (errorStr.includes("network") || errorStr.includes("timeout") || errorStr.includes("fetch")) {
      return "Unable to connect to the server. Please check your internet connection and try again.";
    }
    
    // Payment errors
    if (errorStr.includes("payment") || errorStr.includes("card") || errorStr.includes("stripe")) {
      return "Payment processing failed. Please check your payment details and try again, or use a different payment method.";
    }
    
    // Authentication errors
    if (errorStr.includes("401") || errorStr.includes("unauthorized") || errorStr.includes("authentication")) {
      return "Your session has expired. Please log in again and try placing your order.";
    }
    
    // Server errors
    if (errorStr.includes("500") || errorStr.includes("server error")) {
      return "Our server is experiencing issues. Please try again in a few moments.";
    }
    
    // Validation errors
    if (errorStr.includes("validation") || errorStr.includes("invalid")) {
      return "Some information is missing or incorrect. Please review your order details and try again.";
    }
    
    // Order creation errors
    if (errorStr.includes("order") && errorStr.includes("fail")) {
      return "We couldn't create your order. Your payment has not been charged. Please try again.";
    }
    
    // Default: return the error message if it's user-friendly, otherwise generic message
    if (error.length < 100 && !errorStr.includes("error") && !errorStr.includes("exception")) {
      return error;
    }
    
    return "We couldn't complete your order. Please try again. If the problem persists, contact customer support.";
  };

  const handleConfirmOrder = async () => {
    if (!selectedAddressId || items.length === 0) {
      setError("Please select an address and add items to cart.");
      return;
    }

    if (!isMountedRef.current) return;

    setProcessing(true);
    setError("");

    try {
      // Generate a payment intent ID (in real flow, this would come from payment processing)
      const paymentIntentId = `pi_${Date.now()}`;
      const paymentMethod = "card"; // This would be selected from payment section

      // Confirm and place the order
      const action = await dispatch(
        confirmOrderThunk({
          addressId: selectedAddressId,
          items,
          paymentIntentId,
          paymentMethod,
          total: orderTotal,
          shipping,
        })
      );

      if (!isMountedRef.current) return;

      if (confirmOrderThunk.fulfilled.match(action)) {
        // Store order data for receipt generation
        const orderData = {
          order_code: action.payload?.orderId || `ORD-${Date.now()}`,
          orderId: action.payload?.orderId || `ORD-${Date.now()}`,
          order_date: new Date().toISOString(),
          placedAt: new Date().toISOString(),
          items: items,
          item: items.map(item => ({
            item: item,
            quantity: item.qty,
            product: {
              product_name: item.title,
              product_price: item.price
            }
          })),
          itemsTotal: itemsTotal,
          order_price: itemsTotal,
          total: orderTotal,
          shipping: shipping,
          shipping_cost: shipping.shipping || 0,
          tax: shipping.tax || 0,
          import_charges: shipping.importCharges || 0,
          selectedAddress: selectedAddress,
          drop_location: selectedAddress ? {
            name: selectedAddress.fullName,
            full_address: selectedAddress.address1,
            address2: selectedAddress.address2,
            city: selectedAddress.city,
            district: selectedAddress.state,
            state: selectedAddress.state,
            zip: selectedAddress.zip,
            postal_code: selectedAddress.zip,
            country: selectedAddress.country,
            phone: selectedAddress.phone
          } : null,
          shipping_address: selectedAddress ? {
            name: selectedAddress.fullName,
            full_address: selectedAddress.address1,
            address2: selectedAddress.address2,
            city: selectedAddress.city,
            district: selectedAddress.state,
            state: selectedAddress.state,
            zip: selectedAddress.zip,
            postal_code: selectedAddress.zip,
            country: selectedAddress.country,
            phone: selectedAddress.phone
          } : null,
          paymentMethod: "Card",
          payment_method: "card",
          paymentIntentId: paymentIntentId,
          ref_code: paymentIntentId,
          order_status: "Confirmed",
          status: "Confirmed"
        };
        
        setConfirmedOrderData(orderData);
        setOrderConfirmed(true);
        
        // ONLY clear cart after successful order confirmation
        dispatch(clearCart());
        
        // Don't redirect automatically - let user download receipt first
      } else if (confirmOrderThunk.rejected.match(action)) {
        // Order creation failed - extract error message from payload or error
        const errorMessage = action.payload?.message || 
                           action.error?.message || 
                           "Failed to place order";
        throw new Error(errorMessage);
      } else {
        // Unexpected state
        throw new Error("Unexpected error occurred while placing your order.");
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error("Order confirmation error:", err);
        
        // Format error message for user
        const userFriendlyError = formatErrorMessage(
          err.response?.data?.message || 
          err.message || 
          err.toString()
        );
        
        setError(userFriendlyError);
        
        // DO NOT clear cart on error
        // DO NOT redirect on error - stay on the same page
      }
    } finally {
      if (isMountedRef.current) {
        setProcessing(false);
      }
    }
  };

  const handleEditAddress = () => {
    history.push("/proceed-to-checkout");
  };

  const handleEditPayment = () => {
    history.push("/proceed-to-checkout");
  };

  const handleDownloadReceipt = async () => {
    if (!confirmedOrderData) {
      setError("No order data available. Please confirm your order first.");
      return;
    }

    if (!isMountedRef.current) return;

    setDownloadingReceipt(true);
    setError("");

    try {
      // Get currency from selected country
      const currency = selectedCountry?.currency || 'INR';
      await downloadReceiptPDF(confirmedOrderData, currency);
    } catch (err) {
      if (isMountedRef.current) {
        console.error("Error downloading receipt:", err);
        setError(err.message || "Failed to download receipt. Please try again.");
      }
    } finally {
      if (isMountedRef.current) {
        setDownloadingReceipt(false);
      }
    }
  };

  // If order is already confirmed (from URL), show success even if cart is empty
  if (orderConfirmed && confirmedOrderData) {
    // Show order confirmation success page
    const orderItems = confirmedOrderData.items || [];
    const orderAddress = confirmedOrderData.selectedAddress;
    
    return (
      <div className="orderConfirmationPage">
        <div className="orderConfirmationContainer">
          <div className="orderConfirmationHeader">
            <h1>Order Confirmed!</h1>
            <p className="orderConfirmationSubtitle">
              Your order has been placed successfully
            </p>
          </div>

          <div className="orderConfirmationGrid">
            <div className="orderConfirmationMain">
              {/* Order Items */}
              <section className="orderConfirmationSection">
                <h2>Order Items</h2>
                <div className="orderConfirmationItems">
                  {orderItems.map((item) => (
                    <div className="orderConfirmationItem" key={item.sku || item.id}>
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.title}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "/images/NO_IMG.png";
                        }}
                      />
                      <div className="orderConfirmationItemDetails">
                        <h3>{item.title}</h3>
                        <div className="orderConfirmationItemMeta">
                          <span>Quantity: {item.qty}</span>
                          <span className="orderConfirmationItemPrice">
                            {formatCurrency(item.price * item.qty)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Shipping Address */}
              {orderAddress && (
                <section className="orderConfirmationSection">
                  <h2>Shipping Address</h2>
                  <div className="orderConfirmationAddress">
                    <p className="orderConfirmationAddressName">
                      {orderAddress.fullName}
                    </p>
                    <p className="orderConfirmationAddressLine">
                      {orderAddress.address1}
                    </p>
                    {orderAddress.address2 && (
                      <p className="orderConfirmationAddressLine">
                        {orderAddress.address2}
                      </p>
                    )}
                    <p className="orderConfirmationAddressLine">
                      {orderAddress.city}, {orderAddress.state} {orderAddress.zip}
                    </p>
                    <p className="orderConfirmationAddressLine">
                      {orderAddress.country}
                    </p>
                    <p className="orderConfirmationAddressPhone">
                      Phone: {orderAddress.phone}
                    </p>
                  </div>
                </section>
              )}

              {/* Order Summary */}
              <section className="orderConfirmationSection">
                <h2>Order Summary</h2>
                <div className="orderConfirmationSummary">
                  <div className="orderConfirmationSummaryRow">
                    <span>Items ({orderItems.length}):</span>
                    <span>{formatCurrency(confirmedOrderData.itemsTotal || 0)}</span>
                  </div>
                  <div className="orderConfirmationSummaryRow">
                    <span>Shipping:</span>
                    <span>{formatCurrency(confirmedOrderData.shipping?.shipping || 0)}</span>
                  </div>
                  <div className="orderConfirmationSummaryRow">
                    <span>Tax:</span>
                    <span>{formatCurrency(confirmedOrderData.shipping?.tax || 0)}</span>
                  </div>
                  <div className="orderConfirmationSummaryRow orderConfirmationSummaryRow--total">
                    <span>Order Total:</span>
                    <span>{formatCurrency(confirmedOrderData.total || 0)}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside className="orderConfirmationSidebar">
              <div className="orderConfirmationSidebarCard">
                <div className="orderConfirmationSuccess" style={{
                  backgroundColor: "#d4edda",
                  border: "1px solid #c3e6cb",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "16px",
                  color: "#155724",
                }}>
                  <div style={{ fontWeight: "600", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>✅</span>
                    <span>Order Confirmed!</span>
                  </div>
                  <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
                    Order ID: {orderIdFromUrl || confirmedOrderData.orderId}
                  </p>
                </div>

                <button
                  className="orderConfirmationBtn orderConfirmationBtn--primary"
                  onClick={handleDownloadReceipt}
                  disabled={downloadingReceipt}
                >
                  {downloadingReceipt ? "Generating Receipt..." : "Download Receipt"}
                </button>

                <button
                  className="orderConfirmationBtn orderConfirmationBtn--secondary"
                  onClick={() => history.push("/orders")}
                  style={{ width: "100%", marginTop: "12px" }}
                >
                  View Orders
                </button>

                <button
                  className="orderConfirmationBtn orderConfirmationBtn--secondary"
                  onClick={() => history.push("/")}
                  style={{ width: "100%", marginTop: "12px" }}
                >
                  Continue Shopping
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // If no items and no orderId, show empty cart message
  if (items.length === 0 && !orderIdFromUrl) {
    return (
      <div className="orderConfirmationPage">
        <div className="orderConfirmationCard">
          <h2>No items in cart</h2>
          <p>Please add items to your cart before placing an order.</p>
          <button 
            className="orderConfirmationBtn orderConfirmationBtn--primary"
            onClick={() => history.push("/")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orderConfirmationPage">
      <div className="orderConfirmationContainer">
        <div className="orderConfirmationHeader">
          <h1>Review your order</h1>
          <p className="orderConfirmationSubtitle">
            Please review your order details before confirming
          </p>
        </div>

        <div className="orderConfirmationGrid">
          <div className="orderConfirmationMain">
            {/* Order Items */}
            <section className="orderConfirmationSection">
              <div className="orderConfirmationSectionHeader">
                <h2>Order Items</h2>
                <button 
                  className="orderConfirmationEditBtn"
                  onClick={() => history.push("/proceed-to-checkout")}
                >
                  Edit
                </button>
              </div>
              <div className="orderConfirmationItems">
                {items.map((item) => (
                  <div className="orderConfirmationItem" key={item.sku}>
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "/images/NO_IMG.png";
                      }}
                    />
                    <div className="orderConfirmationItemDetails">
                      <h3>{item.title}</h3>
                      <div className="orderConfirmationItemMeta">
                        <span>Quantity: {item.qty}</span>
                        <span className="orderConfirmationItemPrice">
                          {formatCurrency(item.price * item.qty)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Shipping Address */}
            <section className="orderConfirmationSection">
              <div className="orderConfirmationSectionHeader">
                <h2>Shipping Address</h2>
                <button 
                  className="orderConfirmationEditBtn"
                  onClick={handleEditAddress}
                >
                  Edit
                </button>
              </div>
              {selectedAddress ? (
                <div className="orderConfirmationAddress">
                  <p className="orderConfirmationAddressName">
                    {selectedAddress.fullName}
                  </p>
                  <p className="orderConfirmationAddressLine">
                    {selectedAddress.address1}
                  </p>
                  {selectedAddress.address2 && (
                    <p className="orderConfirmationAddressLine">
                      {selectedAddress.address2}
                    </p>
                  )}
                  <p className="orderConfirmationAddressLine">
                    {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}
                  </p>
                  <p className="orderConfirmationAddressLine">
                    {selectedAddress.country}
                  </p>
                  <p className="orderConfirmationAddressPhone">
                    Phone: {selectedAddress.phone}
                  </p>
                </div>
              ) : (
                <p className="orderConfirmationError">
                  No address selected. Please add an address.
                </p>
              )}
            </section>

            {/* Payment Method */}
            <section className="orderConfirmationSection">
              <div className="orderConfirmationSectionHeader">
                <h2>Payment Method</h2>
                <button 
                  className="orderConfirmationEditBtn"
                  onClick={handleEditPayment}
                >
                  Edit
                </button>
              </div>
              <div className="orderConfirmationPayment">
                <p>Card ending in •••• 4242</p>
                <p className="orderConfirmationPaymentNote">
                  Payment will be processed after order confirmation
                </p>
              </div>
            </section>

            {/* Order Summary */}
            <section className="orderConfirmationSection">
              <h2>Order Summary</h2>
              <div className="orderConfirmationSummary">
                <div className="orderConfirmationSummaryRow">
                  <span>Items ({items.length}):</span>
                  <span>{formatCurrency(itemsTotal)}</span>
                </div>
                <div className="orderConfirmationSummaryRow">
                  <span>Shipping:</span>
                  <span>{formatCurrency(shipping.shipping || 0)}</span>
                </div>
                <div className="orderConfirmationSummaryRow">
                  <span>Tax:</span>
                  <span>{formatCurrency(shipping.tax || 0)}</span>
                </div>
                {shipping.importCharges > 0 && (
                  <div className="orderConfirmationSummaryRow">
                    <span>Import Charges:</span>
                    <span>{formatCurrency(shipping.importCharges || 0)}</span>
                  </div>
                )}
                <div className="orderConfirmationSummaryRow orderConfirmationSummaryRow--total">
                  <span>Order Total:</span>
                  <span>{formatCurrency(orderTotal)}</span>
                </div>
              </div>
            </section>

            {/* Estimated Delivery */}
            <section className="orderConfirmationSection">
              <h2>Estimated Delivery</h2>
              <div className="orderConfirmationDelivery">
                <p className="orderConfirmationDeliveryDate">
                  Arriving by {estimatedDelivery}
                </p>
                <p className="orderConfirmationDeliveryNote">
                  FREE delivery available within 2-4 days
                </p>
              </div>
            </section>
          </div>

          {/* Sidebar - Order Total & Confirm Button */}
          <aside className="orderConfirmationSidebar">
            <div className="orderConfirmationSidebarCard">
              <h3>Order Total</h3>
              <div className="orderConfirmationSidebarTotal">
                {formatCurrency(orderTotal)}
              </div>
              <p className="orderConfirmationSidebarNote">
                By placing your order, you agree to HyderNexa's terms and conditions.
              </p>
              
              {orderConfirmed ? (
                <>
                  {/* Success Message */}
                  <div className="orderConfirmationSuccess" style={{
                    backgroundColor: "#d4edda",
                    border: "1px solid #c3e6cb",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "16px",
                    color: "#155724",
                    fontSize: "14px",
                    lineHeight: "1.5",
                  }}>
                    <div style={{ fontWeight: "600", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>✅</span>
                      <span>Order Confirmed Successfully!</span>
                    </div>
                    <div style={{ marginTop: "8px" }}>
                      Your order has been placed and your cart has been cleared.
                    </div>
                  </div>

                  {/* Download Receipt Button */}
                  <button
                    className="orderConfirmationBtn orderConfirmationBtn--primary"
                    onClick={handleDownloadReceipt}
                    disabled={downloadingReceipt}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    {downloadingReceipt ? (
                      <>
                        <span>⏳</span>
                        <span>Generating Receipt...</span>
                      </>
                    ) : (
                      <>
                        <span>📄</span>
                        <span>Download Receipt</span>
                      </>
                    )}
                  </button>

                  {/* Go to Orders Button */}
                  <div style={{
                    textAlign: "center",
                    marginTop: "16px",
                    padding: "16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    border: "1px solid #dee2e6"
                  }}>
                    <p style={{ margin: "0 0 12px 0", color: "#666", fontSize: "14px" }}>
                      To track your order and view order history, please visit the Orders page.
                    </p>
                    <button
                      className="orderConfirmationBtn orderConfirmationBtn--secondary"
                      onClick={() => history.push("/orders")}
                      style={{ width: "100%" }}
                    >
                      Go to Orders Page
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {error && (
                    <div className="orderConfirmationError" style={{
                      backgroundColor: "#fee",
                      border: "1px solid #fcc",
                      borderRadius: "8px",
                      padding: "16px",
                      marginBottom: "16px",
                      color: "#c00",
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}>
                      <div style={{ fontWeight: "600", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>⚠️</span>
                        <span>Order Failed</span>
                      </div>
                      <div>{error}</div>
                      <div style={{ marginTop: "12px", fontSize: "13px", color: "#666" }}>
                        Your cart has been preserved. Please review the error above and try again.
                      </div>
                    </div>
                  )}

                  <button
                    className="orderConfirmationBtn orderConfirmationBtn--primary"
                    onClick={handleConfirmOrder}
                    disabled={processing || !selectedAddressId || items.length === 0}
                  >
                    {processing ? "Processing..." : "Confirm Order"}
                  </button>

                  <button
                    className="orderConfirmationBtn orderConfirmationBtn--secondary"
                    onClick={() => history.push("/proceed-to-checkout")}
                    disabled={processing}
                  >
                    Back to Checkout
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

