import API from "../../axios";

const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

// Fallback mock orders if API fails
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
];

const ordersStore = {
  orders: [...mockOrders],
};

export const createOrderRecord = async (order) => {
  await delay();
  ordersStore.orders.unshift(order);
  return { data: { order } };
};

/**
 * Fetch orders from API with pagination
 * @param {Object} params - Query parameters
 * @param {string} params.timeRange - Time range filter (e.g., "past 3 months")
 * @param {string} params.query - Search query
 * @param {string} params.tab - Active tab filter
 * @param {number} params.page - Page number (default: 1)
 * @returns {Promise<Object>} Orders data with pagination
 */
export const fetchOrders = async ({ timeRange, query, tab = "orders", page = 1 }) => {
  try {
    const response = await API.get("/v1/orders/order-history/", {
      params: { page },
    });

    // Handle API response format
    let orders = [];
    if (response.data?.results) {
      if (Array.isArray(response.data.results)) {
        orders = response.data.results;
      } else if (response.data.results?.data && Array.isArray(response.data.results.data)) {
        orders = response.data.results.data;
      }
    } else if (Array.isArray(response.data)) {
      orders = response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      orders = response.data.data;
    }

    // Apply client-side filtering if needed
    const normalizedQuery = (query || "").toLowerCase();
    const now = new Date();
    const cutoffMonths = parseInt(timeRange?.replace(/\D/g, "") || "3", 10);
    const cutoffDate = new Date(now);
    cutoffDate.setMonth(now.getMonth() - cutoffMonths);

    const filtered = orders.filter((order) => {
      const matchesQuery =
        !normalizedQuery ||
        order.id?.toLowerCase().includes(normalizedQuery) ||
        order.order_id?.toLowerCase().includes(normalizedQuery) ||
        order.items?.some((item) => 
          item.title?.toLowerCase().includes(normalizedQuery) ||
          item.product_name?.toLowerCase().includes(normalizedQuery)
        );

      const orderDate = order.placedAt || order.created_at || order.order_date;
      const inRange = !orderDate || new Date(orderDate) >= cutoffDate;

      let matchesTab = true;
      if (tab === "buyAgain") {
        matchesTab = order.items?.some((item) => item.qty > 0) ?? true;
      } else if (tab === "notShipped") {
        matchesTab = order.status !== "Delivered" && order.status !== "delivered";
      } else if (tab === "digital") {
        matchesTab = order.items?.some((item) => item.digital) ?? false;
      } else if (tab === "amazonPay" || tab === "hyderNexaPay") {
        matchesTab = order.paymentMethod === "amazonPay" || order.payment_method === "amazonPay";
      }

      return matchesQuery && inRange && matchesTab;
    });

    return {
      data: {
        orders: filtered,
        summary: {
          totalOrders: response.data?.count || filtered.length,
          delivered: filtered.filter((o) => 
            o.status === "Delivered" || o.status === "delivered"
          ).length,
          processing: filtered.filter((o) => 
            o.status !== "Delivered" && o.status !== "delivered"
          ).length,
        },
        pagination: {
          count: response.data?.count || filtered.length,
          next: response.data?.next,
          previous: response.data?.previous,
          currentPage: page,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    
    // Fallback to mock data if API fails (e.g., 401 unauthorized)
    if (error.response?.status === 401) {
      console.warn("Unauthorized - using fallback mock data");
    }
    
    // Apply client-side filtering to mock data
    const normalizedQuery = (query || "").toLowerCase();
    const now = new Date();
    const cutoffMonths = parseInt(timeRange?.replace(/\D/g, "") || "3", 10);
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
      } else if (tab === "amazonPay" || tab === "hyderNexaPay") {
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
  }
};

/**
 * Track order by order code and email
 * GET /api/v1/orders/track-order/{order_code}/{email}/
 * @param {string} orderCode - Order code
 * @param {string} email - Email address
 * @returns {Promise<Object>} Order tracking information
 */
export const trackOrder = async (orderCode, email) => {
  try {
    // URL encode email to handle special characters
    const encodedEmail = encodeURIComponent(email);
    const response = await API.get(`/v1/orders/track-order/${orderCode}/${encodedEmail}/`);
    return {
      data: response.data,
    };
  } catch (error) {
    console.error("Error tracking order:", error);
    throw error;
  }
};

/**
 * Create a return request for a product
 * POST /api/v1/orders/return-product/
 * @param {Object} payload - Return request data
 * @param {string} payload.reason - Reason for return
 * @param {Array<string>} payload.uploaded_images - Array of image URLs
 * @param {string} payload.pickup_location - Pickup location address
 * @param {string} payload.district - District
 * @param {string} payload.city - City
 * @param {string} payload.contact - Contact number
 * @param {string} payload.ordercode - Order code
 * @param {string|number} payload.productvariation_id - Product variation ID
 * @returns {Promise<Object>} Created return request
 */
export const createReturnRequest = async (payload) => {
  try {
    const requestBody = {
      reason: payload.reason || "",
      uploaded_images: Array.isArray(payload.uploaded_images) ? payload.uploaded_images : [],
      pickup_location: payload.pickup_location || "",
      district: payload.district || "",
      city: payload.city || "",
      contact: payload.contact || "",
      ordercode: payload.ordercode || "",
      productvariation_id: String(payload.productvariation_id || ""),
    };
    
    const response = await API.post("/v1/orders/return-product/", requestBody);
    
    // Response format: { id, product, reason, created_at, order_code, pickup_location, district, city, contact, status }
    return {
      data: response.data,
    };
  } catch (error) {
    console.error("Error creating return request:", error);
    throw error;
  }
};

/**
 * Get all return requests
 * GET /api/v1/orders/return-product/
 * @returns {Promise<Array>} Array of return requests
 */
export const getReturnRequests = async () => {
  try {
    const response = await API.get("/v1/orders/return-product/");
    
    // API returns array: [{ id, product, reason, created_at, order_code, ... }]
    const returns = Array.isArray(response.data) ? response.data : [];
    
    return {
      data: returns,
    };
  } catch (error) {
    console.error("Error fetching return requests:", error);
    
    // Return empty array on error (don't break the page)
    if (error.response?.status === 401) {
      console.log("User not authenticated, returning empty return requests");
    }
    
    return {
      data: [],
    };
  }
};

