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
    console.log("[OrdersService] fetchOrders() - Fetching orders with params:", { timeRange, query, tab, page });
    
    const response = await API.get("/v1/orders/order-history/", {
      params: { page },
    });

    console.log("[OrdersService] fetchOrders() - API response:", response.data);

    // Handle API response format
    let orders = [];
    if (response.data?.results) {
      if (Array.isArray(response.data.results)) {
        orders = response.data.results;
      } else if (response.data.results?.data && Array.isArray(response.data.results.data)) {
        orders = response.data.results.data;
      }
    } else if (response.data?.data) {
      if (Array.isArray(response.data.data)) {
        orders = response.data.data;
      }
    } else if (Array.isArray(response.data)) {
      orders = response.data;
    }

    console.log("[OrdersService] fetchOrders() - Extracted orders:", orders.length);

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
 * Fetch order payment information
 * GET /api/v1/payments/order-payment/
 * @param {Object} [params] - Query parameters (optional)
 * @param {string} [params.order_code] - Order code to filter by
 * @returns {Promise<Object>} Payment information
 */
export const fetchOrderPayment = async (params = {}) => {
  try {
    console.log("[OrdersService] fetchOrderPayment() - Fetching order payment with params:", params);
    
    const response = await API.get("/v1/payments/order-payment/", {
      params,
    });
    
    console.log("[OrdersService] fetchOrderPayment() - API response:", response.data);
    console.log("[OrdersService] fetchOrderPayment() - Response status:", response.status);
    console.log("[OrdersService] fetchOrderPayment() - Full response:", response);
    
    return response.data;
  } catch (error) {
    console.error("[OrdersService] fetchOrderPayment() - ERROR:", error);
    console.error("[OrdersService] fetchOrderPayment() - Error response:", error.response);
    console.error("[OrdersService] fetchOrderPayment() - Error message:", error.message);
    throw error;
  }
};

/**
 * Process payment through payment gateway (eSewa, Khalti, or COD)
 * POST /api/v1/payments/order-payment/
 * @param {Object} paymentData - Payment data
 * @param {string} paymentData.payment_method - Payment method: "esewa", "khalti", or "cod"
 * @param {string|number} paymentData.amount - Payment amount
 * @param {string} paymentData.order_code - Order code
 * @param {string} [paymentData.ref_code] - Reference code (optional)
 * @param {string} [paymentData.pidx] - Payment ID (optional)
 * @returns {Promise<Object>} Payment response
 */
export const processOrderPayment = async (paymentData) => {
  try {
    console.log("[OrdersService] processOrderPayment() - Processing payment:", paymentData);
    
    // Validate required fields
    if (!paymentData.payment_method) {
      throw new Error("payment_method is required (esewa, khalti, or cod)");
    }
    if (paymentData.amount === undefined || paymentData.amount === null) {
      throw new Error("amount is required");
    }
    if (!paymentData.order_code) {
      throw new Error("order_code is required");
    }
    
    // Validate payment method
    const validMethods = ["esewa", "khalti", "cod"];
    if (!validMethods.includes(paymentData.payment_method.toLowerCase())) {
      throw new Error(`Invalid payment_method. Must be one of: ${validMethods.join(", ")}`);
    }
    
    // Format amount to 2 decimal places (API requirement)
    const amountValue = parseFloat(paymentData.amount) || 0;
    const formattedAmount = amountValue.toFixed(2);
    
    // Build request body according to API schema
    // All fields must be strings according to schema
    const requestBody = {
      payment_method: String(paymentData.payment_method),
      amount: formattedAmount, // Must have max 2 decimal places
      order_code: String(paymentData.order_code),
    };
    
    // Only include optional fields if they have actual values (not empty strings)
    // API validation requires these fields to not be blank if included
    if (paymentData.ref_code && String(paymentData.ref_code).trim() !== "") {
      requestBody.ref_code = String(paymentData.ref_code).trim();
    }
    if (paymentData.pidx && String(paymentData.pidx).trim() !== "") {
      requestBody.pidx = String(paymentData.pidx).trim();
    }
    
    console.log("[OrdersService] processOrderPayment() - Request body:", requestBody);
    
    const response = await API.post("/v1/payments/order-payment/", requestBody);
    
    console.log("[OrdersService] processOrderPayment() - Payment response:", response.data);
    console.log("[OrdersService] processOrderPayment() - Response status:", response.status);
    return response.data;
  } catch (error) {
    console.error("[OrdersService] processOrderPayment() - ERROR:", error);
    console.error("[OrdersService] processOrderPayment() - Error response:", error.response?.data);
    console.error("[OrdersService] processOrderPayment() - Error status:", error.response?.status);
    throw error;
  }
};

/**
 * Process payment through Stripe
 * POST /api/v1/payments/stripe-payment/
 * @param {Object} cardData - Card payment data
 * @param {string} cardData.card_number - Card number
 * @param {string} cardData.expiry_month - Expiry month (MM format)
 * @param {string} cardData.expiry_year - Expiry year (YYYY format)
 * @param {string} cardData.cvc - CVC/CVV code
 * @returns {Promise<Object>} Stripe payment response
 */
export const processStripePayment = async (cardData) => {
  try {
    console.log("[OrdersService] processStripePayment() - Processing Stripe payment");
    
    // Validate required fields
    if (!cardData.card_number) {
      throw new Error("card_number is required");
    }
    if (!cardData.expiry_month) {
      throw new Error("expiry_month is required");
    }
    if (!cardData.expiry_year) {
      throw new Error("expiry_year is required");
    }
    if (!cardData.cvc) {
      throw new Error("cvc is required");
    }
    
    // Basic validation
    const cardNumber = cardData.card_number.replace(/\s/g, "");
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      throw new Error("Invalid card number length");
    }
    
    const month = parseInt(cardData.expiry_month, 10);
    if (month < 1 || month > 12) {
      throw new Error("Invalid expiry month (must be 01-12)");
    }
    
    const year = parseInt(cardData.expiry_year, 10);
    const currentYear = new Date().getFullYear();
    if (year < currentYear || year > currentYear + 20) {
      throw new Error("Invalid expiry year");
    }
    
    if (cardData.cvc.length < 3 || cardData.cvc.length > 4) {
      throw new Error("Invalid CVC length (must be 3 or 4 digits)");
    }
    
    const response = await API.post("/v1/payments/stripe-payment/", {
      card_number: cardData.card_number,
      expiry_month: String(cardData.expiry_month).padStart(2, "0"),
      expiry_year: String(cardData.expiry_year),
      cvc: cardData.cvc,
    });
    
    console.log("[OrdersService] processStripePayment() - Payment response:", response.data);
    return response.data;
  } catch (error) {
    console.error("[OrdersService] processStripePayment() - ERROR:", error);
    console.error("[OrdersService] processStripePayment() - Error response:", error.response);
    throw error;
  }
};

