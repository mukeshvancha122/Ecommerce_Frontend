import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import "./OrdersPage.css";
import OrdersBreadcrumb from "../../components/Orders/OrdersBreadcrumb";
import OrdersHeaderBar from "../../components/Orders/OrdersHeaderBar";
import OrdersTabsBar from "../../components/Orders/OrdersTabsBar";
import OrdersFilterRow from "../../components/Orders/OrdersFilterRow";
import OrdersContent from "../../components/Orders/OrdersContent";
import RecentlyViewedCarousel from "../../components/RecentlyViewedCarousel/RecentlyViewedCarousel";
import { fetchOrders } from "../../api/orders/OrdersService";
import { useTranslation } from "../../i18n/TranslationProvider";

const tabOptions = [
  { id: "orders", label: "Orders" },
  { id: "buyAgain", label: "Buy again" },
  { id: "notShipped", label: "Not yet shipped" },
];

export default function OrdersPage() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [timeRange, setTimeRange] = useState("past 3 months");
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState("orders");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState({ totalOrders: 0, delivered: 0, processing: 0 });
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to load orders
  const loadOrders = useCallback(() => {
    let mounted = true;
    setLoading(true);
    fetchOrders({ timeRange, query: searchQuery, tab, page })
      .then(({ data }) => {
        if (!mounted) return;
        console.log("[OrdersPage] Loaded orders:", data.orders?.length || 0);
        setOrders(data.orders || []);
        setSummary({
          totalOrders: data.summary?.totalOrders || data.orders?.length || 0,
          delivered: data.summary?.delivered || 0,
          processing: data.summary?.processing || 0,
          pagination: data.pagination,
        });
      })
      .catch((err) => {
        console.error("Error loading orders:", err);
        if (mounted) {
          setOrders([]);
          setSummary({ totalOrders: 0, delivered: 0, processing: 0 });
        }
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [timeRange, searchQuery, tab, page]);

  // Load orders when filters change or page mounts
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Refresh orders when navigating from order confirmation
  useEffect(() => {
    if (location.state?.refreshOrders) {
      console.log("[OrdersPage] Refreshing orders after order confirmation");
      setRefreshKey(prev => prev + 1);
      loadOrders();
      // Clear the refresh flag
      window.history.replaceState({}, document.title);
    }
  }, [location.state, loadOrders]);

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
          pagination={summary.pagination}
          onPageChange={setPage}
        />

        <RecentlyViewedCarousel />
      </div>
    </main>
  );
}
