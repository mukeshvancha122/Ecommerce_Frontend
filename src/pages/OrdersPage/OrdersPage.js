import React, { useState, useEffect } from "react";
import "./OrdersPage.css";
import OrdersBreadcrumb from "../../components/Orders/OrdersBreadcrumb";
import OrdersHeaderBar from "../../components/Orders/OrdersHeaderBar";
import OrdersTabsBar from "../../components/Orders/OrdersTabsBar";
import OrdersFilterRow from "../../components/Orders/OrdersFilterRow";
import OrdersContent from "../../components/Orders/OrdersContent";
import OrdersBottomHistoryBar from "../../components/Orders/OrdersBottomHistoryBar";
import axios from "axios";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [timeRange, setTimeRange] = useState("past 3 months");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    axios
      .get("/api/orders", {
        params: { timeRange, q: searchQuery },
        withCredentials: true,
      })
      .then((res) => {
        setOrders(res.data.orders || []);
      })
      .catch(() => {
        setOrders([]);
      });
  }, [timeRange, searchQuery]);

  return (
    <main className="ordersPage">
      <div className="ordersPage-inner">
        <OrdersBreadcrumb />

        <OrdersHeaderBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <OrdersTabsBar activeTab="Orders" />

        <OrdersFilterRow
          totalOrders={orders.length}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />

        <OrdersContent
          orders={orders}
          emptyMessage={`Looks like you haven't placed an order in the last 3 months.`}
          emptyLinkText="View orders in 2025"
          emptyLinkHref="#"
        />

        <OrdersBottomHistoryBar />
      </div>
    </main>
  );
}
