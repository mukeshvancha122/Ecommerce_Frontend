import React, { useEffect, useMemo, useState } from "react";
import "./OrdersPage.css";
import OrdersBreadcrumb from "../../components/Orders/OrdersBreadcrumb";
import OrdersHeaderBar from "../../components/Orders/OrdersHeaderBar";
import OrdersTabsBar from "../../components/Orders/OrdersTabsBar";
import OrdersFilterRow from "../../components/Orders/OrdersFilterRow";
import OrdersContent from "../../components/Orders/OrdersContent";
import OrdersBottomHistoryBar from "../../components/Orders/OrdersBottomHistoryBar";
import { fetchOrders } from "../../api/orders/OrdersService";
import { useTranslation } from "../../i18n/TranslationProvider";

const tabOptions = [
  { id: "orders", label: "Orders" },
  { id: "buyAgain", label: "Buy again" },
  { id: "notShipped", label: "Not yet shipped" },
  { id: "digital", label: "Digital Orders" },
  { id: "amazonPay", label: "HyderNexa Pay" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [timeRange, setTimeRange] = useState("past 3 months");
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState("orders");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalOrders: 0, delivered: 0, processing: 0 });
  const { t } = useTranslation();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchOrders({ timeRange, query: searchQuery, tab })
      .then(({ data }) => {
        if (!mounted) return;
        setOrders(data.orders || []);
        setSummary(data.summary || summary);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [timeRange, searchQuery, tab]);

  const metrics = useMemo(
    () => [
      { label: "Orders placed", value: summary.totalOrders },
      { label: "Delivered", value: summary.delivered },
      { label: "In progress", value: summary.processing },
    ],
    [summary]
  );

  return (
    <main className="ordersPage">
      <div className="ordersPage-inner">
        <OrdersBreadcrumb />

        <OrdersHeaderBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          summary={metrics}
        />

        <OrdersTabsBar
          activeTab={tab}
          onTabChange={setTab}
          options={tabOptions}
        />

        <OrdersFilterRow
          totalOrders={orders.length}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />

        <OrdersContent
          tab={tab}
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
