const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

const mockOrders = [
  {
    id: "order_2025_001",
    placedAt: "2025-02-12T09:15:00.000Z",
    total: 189.99,
    status: "Delivered",
    paymentMethod: "card",
    addressId: "addr_1",
    items: [
      {
        sku: "noise-cancelling-earbuds",
        title: "Noise Cancelling Earbuds (Black)",
        qty: 1,
        price: 129.99,
        image: "/images/products/tshirt_black_480x400.webp",
      },
      {
        sku: "charger-pro",
        title: "USB-C Fast Charger Pro",
        qty: 1,
        price: 60,
        image: "/images/products/tshirt_green_480x400.webp",
      },
    ],
    fulfillment: {
      lastUpdate: "Delivered Feb 15",
      trackingId: "HYDNX123456789",
      expectedBy: "2025-02-15T10:00:00.000Z",
    },
    actions: ["Buy it again", "Return or replace items", "Get invoice"],
  },
  {
    id: "order_2024_017",
    placedAt: "2024-12-28T11:20:00.000Z",
    total: 72.9,
    status: "Processing",
    paymentMethod: "paypal",
    addressId: "addr_2",
    items: [
      {
        sku: "fitness-band",
        title: "Ultra Fit Smart Band",
        qty: 1,
        price: 72.9,
        image: "/images/products/tshirt_red_480x400.webp",
      },
    ],
    fulfillment: {
      lastUpdate: "Arriving Feb 20",
      trackingId: "HYDNX987654321",
      expectedBy: "2025-02-20T10:00:00.000Z",
    },
    actions: ["Track package", "Contact support"],
  },
];

const ordersStore = {
  orders: [...mockOrders],
};

export const createOrderRecord = async (order) => {
  await delay();
  ordersStore.orders.unshift(order);
  return { data: { order } };
};

export const fetchOrders = async ({ timeRange, query, tab = "orders" }) => {
  await delay();
  const normalizedQuery = (query || "").toLowerCase();
  const now = new Date();
  const cutoffMonths = parseInt(timeRange.replace(/\D/g, ""), 10) || 3;
  const cutoffDate = new Date(now);
  cutoffDate.setMonth(now.getMonth() - cutoffMonths);

  const filtered = ordersStore.orders.filter((order) => {
    const matchesQuery =
      !normalizedQuery ||
      order.id.toLowerCase().includes(normalizedQuery) ||
      order.items.some((item) => item.title.toLowerCase().includes(normalizedQuery));

    const inRange = new Date(order.placedAt) >= cutoffDate;

    let matchesTab = true;
    if (tab === "buyAgain") {
      matchesTab = order.items.some((item) => item.qty > 0);
    } else if (tab === "notShipped") {
      matchesTab = order.status !== "Delivered";
    } else if (tab === "digital") {
      matchesTab = order.items.some((item) => item.digital);
    } else if (tab === "amazonPay") {
      matchesTab = order.paymentMethod === "amazonPay";
    }

    return matchesQuery && inRange && matchesTab;
  });

  return {
    data: {
      orders: filtered,
      summary: {
        totalOrders: ordersStore.orders.length,
        delivered: ordersStore.orders.filter((o) => o.status === "Delivered").length,
        processing: ordersStore.orders.filter((o) => o.status !== "Delivered").length,
      },
    },
  };
};

