import "./OrdersEmptyState.css";

export default function OrdersEmptyState({ message, ctaText, ctaHref }) {
  return (
    <div className="ordersEmptyState">
      <div className="ordersEmptyState-text">
        {message}{" "}
        <a className="ordersEmptyState-link" href={ctaHref}>
          {ctaText}
        </a>
      </div>
    </div>
  );
}
