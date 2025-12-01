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
    console.log("[OrdersPage] loadOrders() - Starting to load orders...");
    console.log("[OrdersPage] loadOrders() - Request params:", { timeRange, query: searchQuery, tab, page, fetchAll: true });
    
    // Use fetchAll=true to get all orders from all pages
    fetchOrders({ timeRange, query: searchQuery, tab, page, fetchAll: true })
      .then(({ data }) => {
        if (!mounted) return;
        console.log("[OrdersPage] loadOrders() - Orders loaded successfully:", {
          orders_count: data.orders?.length || 0,
          summary: data.summary,
          pagination: data.pagination,
        });
        
        // Ensure we have an array
        const ordersArray = Array.isArray(data.orders) ? data.orders : [];
        console.log("[OrdersPage] loadOrders() - Setting orders in state:", ordersArray.length);
        
        if (ordersArray.length > 0) {
          console.log("[OrdersPage] loadOrders() - Sample order:", {
            id: ordersArray[0].id,
            order_code: ordersArray[0].order_code,
            status: ordersArray[0].status,
            items_count: ordersArray[0].items?.length || 0,
          });
        }
        
        setOrders(ordersArray);
        setSummary({
          totalOrders: data.summary?.totalOrders || ordersArray.length || 0,
          delivered: data.summary?.delivered || 0,
          processing: data.summary?.processing || 0,
          pagination: data.pagination,
        });
      })
      .catch((err) => {
        console.error("[OrdersPage] loadOrders() - ========== ERROR LOADING ORDERS ==========");
        console.error("[OrdersPage] loadOrders() - Error:", err);
        console.error("[OrdersPage] loadOrders() - Error message:", err.message);
        console.error("[OrdersPage] loadOrders() - Error response:", err.response);
        if (err.response) {
          console.error("[OrdersPage] loadOrders() - Status:", err.response.status);
          console.error("[OrdersPage] loadOrders() - Data:", err.response.data);
        }
        console.error("[OrdersPage] loadOrders() - =========================================");
        if (mounted) {
          setOrders([]);
          setSummary({ totalOrders: 0, delivered: 0, processing: 0 });
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
          console.log("[OrdersPage] loadOrders() - Loading completed");
        }
      });
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
