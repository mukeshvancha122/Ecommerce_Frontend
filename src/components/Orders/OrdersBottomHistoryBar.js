import "./OrdersBottomHistoryBar.css";

export default function OrdersBottomHistoryBar() {
  return (
    <div className="ordersHistoryBar">
      <div className="ordersHistoryBar-left">
        After viewing product detail pages, look here to find an easy way
        to navigate back to pages you are interested in.
      </div>

      <a className="ordersHistoryBar-right" href="#">
        <span className="ordersHistoryBar-arrow">›</span>
        <div className="ordersHistoryBar-textWrap">
          <div className="ordersHistoryBar-linkMain">
            View or edit your browsing history
          </div>
        </div>
      </a>
    </div>
  );
}
