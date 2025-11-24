import API from "../../axios";

/**
 * Create Order Record (local helper for UI consistency)
 * This is kept for local state management, actual order creation happens in placeOrder
 */
export const createOrderRecord = async (order) => {
  // This is a local helper function for UI state management
  // The actual order is created via placeOrder API call
  return { data: { order } };
};

/**
 * Fetch Orders
 * GET /api/v1/orders/?timeRange=3&query=search&tab=orders
 */
export const fetchOrders = async ({ timeRange, query, tab = "orders" }) => {
  try {
    const response = await API.get("/api/v1/orders/", {
      params: {
        time_range: timeRange,
        query: query,
        tab: tab,
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

