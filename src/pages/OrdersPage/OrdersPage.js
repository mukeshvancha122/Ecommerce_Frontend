import React, { useEffect, useMemo, useState } from "react";
import "./OrdersPage.css";
import OrdersContent from "../../components/Orders/OrdersContent";
import { fetchOrders } from "../../api/orders/OrdersService";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalOrders: 0, delivered: 0, processing: 0 });
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    console.log(`[OrdersPage] loadOrders() - Fetching orders for page ${page}...`);

    fetchOrders({ page })
      .then(({ data }) => {
        if (!mounted) return;
        console.log("[OrdersPage] loadOrders() - Orders loaded successfully:", {
          orders_count: data.orders?.length || 0,
          summary: data.summary,
        });

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
        });

        const paginationData = data.pagination || {
          count: ordersArray.length,
          next: null,
          previous: null,
          currentPage: page,
        };

        setPagination({
          ...paginationData,
          currentPage: paginationData.currentPage || page,
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
          setPagination(null);
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
  }, [page]);

  const handlePageChange = (nextPage) => {
    if (!nextPage || nextPage === page || nextPage < 1) {
      return;
    }
    setPage(nextPage);
  };

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
        <section className="ordersPage-summary">
          <h1 className="ordersPage-title">Your Orders</h1>
          <div className="ordersPage-metrics">
            {metrics.map((metric) => (
              <div key={metric.label} className="ordersPage-metricCard">
                <div className="ordersPage-metricValue">{metric.value}</div>
                <div className="ordersPage-metricLabel">{metric.label}</div>
              </div>
            ))}
          </div>
        </section>

        <OrdersContent
          tab="orders"
          orders={orders}
          loading={loading}
          emptyMessage="You have not placed any orders yet."
          emptyLinkText="Start shopping"
          emptyLinkHref="/"
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </main>
  );
}
