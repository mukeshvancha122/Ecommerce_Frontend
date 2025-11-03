import "./OrdersContent.css";
import OrdersEmptyState from "./OrdersEmptyState";
import SponsoredAdCard from "../../components/Adcard/SponsoredAdCard";

export default function OrdersContent({
  orders,
  emptyMessage,
  emptyLinkText,
  emptyLinkHref,
}) {
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
      {/* Example of how you'd render real orders */}
      {orders.map((order) => (
        <div key={order.id}>Order card goes here</div>
      ))}
    </div>
  );
}
