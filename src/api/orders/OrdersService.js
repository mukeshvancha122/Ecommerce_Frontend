const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

const ordersStore = {
  orders: [],
};

export const createOrderRecord = async (order) => {
  await delay();
  ordersStore.orders.unshift(order);
  return { data: { order } };
};

export const fetchOrders = async ({ timeRange, query }) => {
  await delay();
  const normalizedQuery = (query || "").toLowerCase();
  const filtered = ordersStore.orders.filter((order) => {
    if (!normalizedQuery) return true;
    return (
      order.id.toLowerCase().includes(normalizedQuery) ||
      order.items.some((item) => item.title.toLowerCase().includes(normalizedQuery))
    );
  });
  return {
    data: {
      orders: filtered,
    },
  };
};

