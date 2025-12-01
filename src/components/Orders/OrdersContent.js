import React, { useState } from "react";
import "./OrdersContent.css";
import OrdersEmptyState from "./OrdersEmptyState";
import { formatCurrency } from "../../utils/currency";
import { getImageUrl } from "../../utils/imageUtils";
import { downloadReceipt, sendReceiptEmail } from "../../utils/receiptGenerator";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/auth/AuthSlice";

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function OrdersContent({
  orders,
  loading,
  emptyMessage,
  emptyLinkText,
  emptyLinkHref,
  tab,
  pagination,
  onPageChange,
}) {
  const user = useSelector(selectUser);
  const [sendingEmail, setSendingEmail] = useState({});
  
  const handleDownloadReceipt = async (order) => {
    try {
      await downloadReceipt(order);
    } catch (error) {
      alert("Failed to download receipt. Please try again.");
      console.error("Receipt download error:", error);
    }
  };
  
  const handleSendReceiptEmail = async (order) => {
    if (!user?.email) {
      alert("Please log in to send receipt via email.");
      return;
    }
    
    setSendingEmail({ ...sendingEmail, [order.id]: true });
    
    try {
      await sendReceiptEmail(order, user.email);
      alert("Receipt sent to your email successfully!");
    } catch (error) {
      alert(error.message || "Failed to send receipt email. Please try again.");
      console.error("Email send error:", error);
    } finally {
      setSendingEmail({ ...sendingEmail, [order.id]: false });
    }
  };
  if (loading) {
    return <div className="orders-loading">Loading your orders…</div>;
  }

  if (!orders || orders.length === 0) {
    return (
      <OrdersEmptyState
        message={emptyMessage}
        ctaText={emptyLinkText}
        ctaHref={emptyLinkHref}
      />
    );
  }

  return (
    <div className="ordersContent-orderList">
      {orders.map((order) => (
        <article className="ordersCard" key={order.id}>
          <header className="ordersCard-header">
            <div>
              <div className="ordersCard-label">Order placed</div>
              <div className="ordersCard-value">
                {formatDate(order.placedAt || order.created_at || order.order_date || new Date())}
              </div>
            </div>
            <div>
              <div className="ordersCard-label">Total</div>
              <div className="ordersCard-value">{formatCurrency(order.order_price || order.total || 0)}</div>
            </div>
            {(order.drop_location || order.shipping_address) && (
              <div>
                <div className="ordersCard-label">Ship to</div>
                <div className="ordersCard-value">
                  {(order.drop_location?.city || order.shipping_address?.city || "")}, {(order.drop_location?.district || order.shipping_address?.state || "")}
                </div>
              </div>
            )}
            <div className="ordersCard-id">
              <div className="ordersCard-label">Order #</div>
              <div className="ordersCard-value">{order.id || order.order_id || order.order_number}</div>
            </div>
          </header>
          <div className="ordersCard-status">
            <div>
              <span className="ordersCard-statusBadge">
                {order.status || order.order_status || "Processing"}
              </span>
              {order.fulfillment?.lastUpdate && (
                <span className="ordersCard-statusText">
                  {order.fulfillment.lastUpdate}
                </span>
              )}
            </div>
            {(order.paymentMethod || order.payment_method) && (
              <span className="ordersCard-statusText">
                Paid via {(order.paymentMethod || order.payment_method).toUpperCase()}
              </span>
            )}
          </div>
          <div className="ordersCard-tracking">
            {order.tracking_id && (
              <div>
                <p className="ordersCard-label">Tracking ID</p>
                <p className="ordersCard-value">{order.tracking_id}</p>
              </div>
            )}
            {order.expected_delivery_date && (
              <div>
                <p className="ordersCard-label">Arriving by</p>
                <p className="ordersCard-value">
                  {formatDate(order.expected_delivery_date)}
                </p>
              </div>
            )}
            {order.fulfillment?.trackingId && (
              <div>
                <p className="ordersCard-label">Tracking ID</p>
                <p className="ordersCard-value">{order.fulfillment.trackingId}</p>
              </div>
            )}
            {order.fulfillment?.expectedBy && (
              <div>
                <p className="ordersCard-label">Arriving by</p>
                <p className="ordersCard-value">
                  {formatDate(order.fulfillment.expectedBy)}
                </p>
              </div>
            )}
            {(order.tracking_id || order.fulfillment?.trackingId) && (
              <button className="ordersItem-link">Track package</button>
            )}
          </div>
          <div className="ordersCard-items">
            {((order.item && Array.isArray(order.item) ? order.item : []) || 
              (order.items && Array.isArray(order.items) ? order.items : []) || 
              []).map((item, idx) => {
              // Handle backend format: order.item[].item.product
              const productItem = item.item || item;
              const product = productItem.product || productItem;
              const quantity = item.quantity || productItem.quantity || item.qty || 1;
              const price = productItem.product_price || product.product_price || item.price || 0;
              const productName = product.product_name || productItem.product_name || item.title || "Product";
              const productImages = productItem.product_images || product.product_images || item.product_images || [];
              const productImage = productImages.length > 0 ? productImages[0]?.product_image : null;
              const finalImage = productImage || item.image || null;
              
              return (
                <div className="ordersItem" key={`${order.id}-${item.id || idx}`}>
                  <img 
                    src={getImageUrl(finalImage)} 
                    alt={productName} 
                    loading="lazy"
                    onError={(e) => {
                      if (e.target.src !== "/images/NO_IMG.png" && !e.target.src.includes("NO_IMG")) {
                        e.target.src = "/images/NO_IMG.png";
                        e.target.onerror = null;
                      }
                    }}
                  />
                  <div className="ordersItem-body">
                    <div className="ordersItem-title">{productName}</div>
                    <div className="ordersItem-meta">
                      Qty: {quantity} · {formatCurrency(price * quantity)}
                    </div>
                    <div className="ordersItem-actions">
                      <button className="ordersItem-btn">Buy it again</button>
                      <button className="ordersItem-link">Return or replace</button>
                      {tab === "buyAgain" && (
                        <button className="ordersItem-link">View similar</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="ordersCard-footer">
            <button 
              className="ordersFooter-btn"
              onClick={() => handleDownloadReceipt(order)}
            >
              Download Receipt
            </button>
            <button 
              className="ordersFooter-btn"
              onClick={() => handleSendReceiptEmail(order)}
              disabled={sendingEmail[order.id]}
            >
              {sendingEmail[order.id] ? "Sending..." : "Email Receipt"}
            </button>
            <button className="ordersFooter-btn">Archive order</button>
          </div>
        </article>
      ))}
      {pagination && (pagination.next || pagination.previous) && (
        <div className="ordersContent-pagination">
          <button
            className="ordersContent-paginationBtn"
            onClick={() => onPageChange && onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.previous}
          >
            Previous
          </button>
          <span className="ordersContent-paginationInfo">
            Page {pagination.currentPage || 1}
          </span>
          <button
            className="ordersContent-paginationBtn"
            onClick={() => onPageChange && onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.next}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
