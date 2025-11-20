import "./OrdersContent.css";
import OrdersEmptyState from "./OrdersEmptyState";
import SponsoredAdCard from "../../components/Adcard/SponsoredAdCard";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

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
}) {
  if (loading) {
    return <div className="orders-loading">Loading your orders…</div>;
  }

  if (!orders || orders.length === 0) {
    return (
      <>
        <OrdersEmptyState
          message={emptyMessage}
          ctaText={emptyLinkText}
          ctaHref={emptyLinkHref}
        />
        <SponsoredAdCard />
      </>
    );
  }

  return (
    <div className="ordersContent-orderList">
      {orders.map((order) => (
        <article className="ordersCard" key={order.id}>
          <header className="ordersCard-header">
            <div>
              <div className="ordersCard-label">Order placed</div>
              <div className="ordersCard-value">{formatDate(order.placedAt)}</div>
            </div>
            <div>
              <div className="ordersCard-label">Total</div>
              <div className="ordersCard-value">{currency.format(order.total || 0)}</div>
            </div>
            <div>
              <div className="ordersCard-label">Ship to</div>
              <div className="ordersCard-value">{order.addressId}</div>
            </div>
            <div className="ordersCard-id">
              <div className="ordersCard-label">Order #</div>
              <div className="ordersCard-value">{order.id}</div>
            </div>
          </header>
          <div className="ordersCard-status">
            <span className="ordersCard-statusBadge">{order.status}</span>
            <span className="ordersCard-statusText">
              Paid via {order.paymentMethod?.toUpperCase()}
            </span>
          </div>
          <div className="ordersCard-items">
            {order.items.map((item) => (
              <div className="ordersItem" key={`${order.id}-${item.sku}`}>
                <img src={item.image} alt={item.title} loading="lazy" />
                <div className="ordersItem-body">
                  <div className="ordersItem-title">{item.title}</div>
                  <div className="ordersItem-meta">
                    Qty: {item.qty} · {currency.format(item.price * item.qty)}
                  </div>
                  <div className="ordersItem-actions">
                    <button className="ordersItem-btn">Buy it again</button>
                    <button className="ordersItem-link">Track package</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
