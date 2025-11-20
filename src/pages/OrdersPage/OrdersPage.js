import React, { useState, useEffect } from "react";
import "./OrdersPage.css";
import OrdersBreadcrumb from "../../components/Orders/OrdersBreadcrumb";
import OrdersHeaderBar from "../../components/Orders/OrdersHeaderBar";
import OrdersTabsBar from "../../components/Orders/OrdersTabsBar";
import OrdersFilterRow from "../../components/Orders/OrdersFilterRow";
import OrdersContent from "../../components/Orders/OrdersContent";
import OrdersBottomHistoryBar from "../../components/Orders/OrdersBottomHistoryBar";
import { fetchOrders } from "../../api/orders/OrdersService";
import { useTranslation } from "../../i18n/TranslationProvider";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [timeRange, setTimeRange] = useState("past 3 months");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchOrders({ timeRange, query: searchQuery })
      .then(({ data }) => {
        if (mounted) setOrders(data.orders || []);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [timeRange, searchQuery]);

  return (
    <main className="ordersPage">
      <div className="ordersPage-inner">
        <OrdersBreadcrumb />

        <OrdersHeaderBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <OrdersTabsBar activeTab="Orders" />

        <OrdersFilterRow
          totalOrders={orders.length}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />

        <OrdersContent
          orders={orders}
          loading={loading}
          emptyMessage={t("orders.empty")}
          emptyLinkText={t("orders.viewYear")}
          emptyLinkHref="#"
        />

        <OrdersBottomHistoryBar />
      </div>
    </main>
  );
}
