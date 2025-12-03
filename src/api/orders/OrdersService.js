import API from "../../axios";

const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

/**
 * Fetch orders from API with pagination
 * @param {Object} params - Query parameters
 * @param {string} params.timeRange - Time range filter (e.g., "past 3 months")
 * @param {string} params.query - Search query
 * @param {string} params.tab - Active tab filter
 * @param {number} params.page - Page number (default: 1)
 * @returns {Promise<Object>} Orders data with pagination
 */
/**
 * Fetch all orders from all pages (for complete order history)
 * @param {Object} params - Query parameters
 * @param {string} params.query - Search query (optional)
 * @returns {Promise<Array>} All orders from all pages
 */
const fetchAllOrdersPages = async ({ query }) => {
  const allOrders = [];
  let currentPage = 1;
  let hasMore = true;
  
  while (hasMore) {
    const params = { page: currentPage };
    
    // Add search parameters if query provided
    if (query && query.trim()) {
      params.search = query.trim();
      if (query.trim().toLowerCase().startsWith('order_') || /^[a-z0-9_]+$/i.test(query.trim())) {
        params.order_code = query.trim();
      }
    }
    
    const response = await API.get("/v1/orders/order-history/", { params });
    const pageOrders = response.data?.results || [];
    
    if (pageOrders.length > 0) {
      allOrders.push(...pageOrders);
    }
    
    // Check if there's a next page
    hasMore = !!response.data?.next && pageOrders.length > 0;
    currentPage++;
    
    // Safety limit to prevent infinite loops
    if (currentPage > 100) {
      console.warn("[OrdersService] fetchAllOrdersPages() - Reached page limit (100), stopping");
      break;
    }
  }
  
  console.log("[OrdersService] fetchAllOrdersPages() - Fetched", allOrders.length, "orders from", currentPage - 1, "pages");
  return allOrders;
};

export const fetchOrders = async ({ timeRange, query, tab = "orders", page = 1, fetchAll = false }) => {
  try {
    console.log("[OrdersService] fetchOrders() - ========== FETCH ORDERS START ==========");
    console.log("[OrdersService] fetchOrders() - Fetching orders with params:", { timeRange, query, tab, page, fetchAll });
    
    let rawOrders = [];
    let responseData = null;
    let usedBackendSearch = false;
    
    if (fetchAll) {
      // Fetch all orders from all pages
      console.log("[OrdersService] fetchOrders() - Fetching ALL orders (all pages)");
      rawOrders = await fetchAllOrdersPages({ query });
      usedBackendSearch = !!(query && query.trim());
      // Create a mock response data structure for consistency
      responseData = {
        count: rawOrders.length,
        results: rawOrders,
        next: null,
        previous: null,
      };
    } else {
      // Build query parameters for the API
      // The API may support search by order_code, so we'll pass the query if provided
      const params = { page };
      
      // If there's a search query, pass it to the backend
      // The backend might support search by order_code or other fields
      if (query && query.trim()) {
        params.search = query.trim();
        usedBackendSearch = true;
        // Also try order_code parameter if the query looks like an order code
        if (query.trim().toLowerCase().startsWith('order_') || /^[a-z0-9_]+$/i.test(query.trim())) {
          params.order_code = query.trim();
        }
      }
      
      console.log("[OrdersService] fetchOrders() - Making API request to /v1/orders/order-history/");
      console.log("[OrdersService] fetchOrders() - API request params:", params);
      
      try {
    const response = await API.get("/v1/orders/order-history/", {
          params: params,
        });
        
        console.log("[OrdersService] fetchOrders() - API response status:", response.status);
        console.log("[OrdersService] fetchOrders() - API response headers:", response.headers);
        console.log("[OrdersService] fetchOrders() - API response data:", JSON.stringify(response.data, null, 2));
        
        responseData = response.data;

        // Handle API response format: { count, next, previous, results: [...] }
        if (responseData?.results) {
          if (Array.isArray(responseData.results)) {
            rawOrders = responseData.results;
            console.log("[OrdersService] fetchOrders() - Found orders in response.results:", rawOrders.length);
          } else if (responseData.results?.data && Array.isArray(responseData.results.data)) {
            rawOrders = responseData.results.data;
            console.log("[OrdersService] fetchOrders() - Found orders in response.results.data:", rawOrders.length);
      }
        } else if (responseData?.data) {
          if (Array.isArray(responseData.data)) {
            rawOrders = responseData.data;
            console.log("[OrdersService] fetchOrders() - Found orders in response.data:", rawOrders.length);
      }
        } else if (Array.isArray(responseData)) {
          rawOrders = responseData;
          console.log("[OrdersService] fetchOrders() - Response is direct array:", rawOrders.length);
        } else {
          console.warn("[OrdersService] fetchOrders() - Unexpected response format:", {
            has_results: !!responseData?.results,
            has_data: !!responseData?.data,
            is_array: Array.isArray(responseData),
            response_keys: responseData ? Object.keys(responseData) : [],
            response_data: responseData,
          });
        }
      } catch (apiError) {
        console.error("[OrdersService] fetchOrders() - API request failed:", apiError);
        console.error("[OrdersService] fetchOrders() - Error details:", {
          message: apiError.message,
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          headers: apiError.response?.headers,
        });
        
        // Re-throw to be handled by outer catch
        throw apiError;
      }
    }

    console.log("[OrdersService] fetchOrders() - Extracted raw orders:", rawOrders.length);
    
    if (rawOrders.length === 0) {
      console.warn("[OrdersService] fetchOrders() - WARNING: No orders found in API response");
      console.warn("[OrdersService] fetchOrders() - Response data structure:", {
        has_results: !!responseData?.results,
        has_data: !!responseData?.data,
        is_array: Array.isArray(responseData),
        response_keys: responseData ? Object.keys(responseData) : [],
        response_count: responseData?.count,
        response_next: responseData?.next,
        response_previous: responseData?.previous,
      });
    }

    // Transform API order format to frontend format
    // API format: { item: [...], order_date, order_price, order_code, order_status, payment: [...], drop_location: {...}, delivered_by }
    // Frontend format: { id, placedAt, total, status, paymentMethod, items: [...], addressId, ... }
    const orders = rawOrders.map((apiOrder) => {
      // Transform items array
      const items = (apiOrder.item || []).map((orderItem) => {
        const product = orderItem.item?.product || {};
        const productImages = orderItem.item?.product_images || [];
        const firstImage = productImages.length > 0 ? productImages[0]?.product_image : null;
        
        return {
          id: orderItem.id,
          sku: orderItem.item?.id || orderItem.id,
          productId: product.id,
          title: product.product_name || "Product",
          description: product.product_description || "",
          price: parseFloat(orderItem.item?.product_price || 0),
          qty: orderItem.quantity || 1,
          image: firstImage || "/images/NO_IMG.png",
          color: orderItem.item?.product_color || "",
          size: orderItem.item?.product_size || "",
          brand: product.brand || 0,
          discountedPrice: parseFloat(orderItem.item?.get_discounted_price || orderItem.item?.product_price || 0),
          stock: orderItem.item?.stock || "0",
        };
      });

      // Extract payment method
      const payment = apiOrder.payment?.[0] || {};
      const paymentMethod = payment.payment_method || "card";

      // Extract address information
      const dropLocation = apiOrder.drop_location || {};
      const addressId = dropLocation.id ? String(dropLocation.id) : null;

      // Map order status from API format to frontend format
      // API: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
      // Frontend: Pending, Processing, Shipped, Delivered, Cancelled
      const statusMap = {
        "PENDING": "Processing",
        "CONFIRMED": "Processing",
        "SHIPPED": "Shipped",
        "DELIVERED": "Delivered",
        "CANCELLED": "Cancelled",
      };
      const rawStatus = (apiOrder.order_status || "PENDING").toUpperCase();
      const mappedStatus = statusMap[rawStatus] || "Processing";

      // Transform order
      return {
        id: apiOrder.order_code || apiOrder.id,
        order_code: apiOrder.order_code,
        orderId: apiOrder.order_code,
        placedAt: apiOrder.order_date,
        created_at: apiOrder.order_date,
        order_date: apiOrder.order_date,
        total: parseFloat(apiOrder.order_price || 0),
        order_price: parseFloat(apiOrder.order_price || 0),
        status: mappedStatus,
        order_status: apiOrder.order_status || "PENDING",
        paymentMethod: paymentMethod,
        payment_method: paymentMethod,
        payment: apiOrder.payment || [],
        items: items,
        addressId: addressId,
        drop_location: dropLocation,
        delivered_by: apiOrder.delivered_by || "",
        // Additional fields for compatibility
        fulfillment: {
          lastUpdate: apiOrder.order_status || "Processing",
          trackingId: apiOrder.order_code || "",
          expectedBy: apiOrder.order_date || null,
        },
        actions: ["Buy it again", "Return or replace items", "Get invoice"],
      };
    });

    console.log("[OrdersService] fetchOrders() - Transformed orders:", orders.length);

    // Apply client-side filtering for time range and tab filters
    // Note: If backend supports search, it's already filtered by query
    // We still do client-side filtering for time range and tab filters
    const normalizedQuery = (query || "").toLowerCase();
    const now = new Date();
    const cutoffMonths = parseInt(timeRange?.replace(/\D/g, "") || "3", 10);
    const cutoffDate = new Date(now);
    cutoffDate.setMonth(now.getMonth() - cutoffMonths);

    const filtered = orders.filter((order) => {
      // If backend search was used, we trust the backend results
      // Otherwise, apply client-side search filtering
      const matchesQuery = !query || !query.trim() || 
        order.id?.toLowerCase().includes(normalizedQuery) ||
        order.order_code?.toLowerCase().includes(normalizedQuery) ||
        order.orderId?.toLowerCase().includes(normalizedQuery) ||
        order.order_id?.toLowerCase().includes(normalizedQuery) ||
        order.items?.some((item) => 
          item.title?.toLowerCase().includes(normalizedQuery) ||
          item.product_name?.toLowerCase().includes(normalizedQuery)
        );

      // Apply time range filter
      const orderDate = order.placedAt || order.created_at || order.order_date;
      const inRange = !orderDate || new Date(orderDate) >= cutoffDate;

      // Apply tab filter
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

    console.log("[OrdersService] fetchOrders() - Filtered orders:", filtered.length, {
      query: query || "none",
      timeRange,
      tab,
      backend_search: usedBackendSearch,
    });

    const result = {
      data: {
        orders: filtered,
        summary: {
          totalOrders: responseData?.count || filtered.length,
          delivered: filtered.filter((o) => 
            o.status === "Delivered" || o.status === "delivered"
          ).length,
          processing: filtered.filter((o) => 
            o.status !== "Delivered" && o.status !== "delivered"
          ).length,
        },
        pagination: {
          count: responseData?.count || filtered.length,
          next: responseData?.next,
          previous: responseData?.previous,
          currentPage: page,
        },
      },
    };
    
    console.log("[OrdersService] fetchOrders() - Final result:", {
      total_orders: result.data.orders.length,
      summary: result.data.summary,
      pagination: result.data.pagination,
      first_order_sample: result.data.orders.length > 0 ? {
        id: result.data.orders[0].id,
        order_code: result.data.orders[0].order_code,
        status: result.data.orders[0].status,
        items_count: result.data.orders[0].items?.length || 0,
      } : null,
    });
    
    if (result.data.orders.length === 0) {
      console.warn("[OrdersService] fetchOrders() - NO ORDERS TO DISPLAY");
      console.warn("[OrdersService] fetchOrders() - This could mean:");
      console.warn("  1. User has no orders in the backend");
      console.warn("  2. Orders are outside the time range filter");
      console.warn("  3. API returned empty results");
      console.warn("  4. Response format doesn't match expected structure");
    }
    
    console.log("[OrdersService] fetchOrders() - ========== FETCH ORDERS SUCCESS ==========");
    
    return result;
  } catch (error) {
    console.error("=".repeat(80));
    console.error("[OrdersService] fetchOrders() - ========== FETCH ORDERS ERROR ==========");
    console.error("[OrdersService] fetchOrders() - Error fetching orders:", error);
    console.error("[OrdersService] fetchOrders() - Error message:", error.message);
    console.error("[OrdersService] fetchOrders() - Error stack:", error.stack);
    
    if (error.response) {
      console.error("[OrdersService] fetchOrders() - Error response status:", error.response.status);
      console.error("[OrdersService] fetchOrders() - Error response statusText:", error.response.statusText);
      console.error("[OrdersService] fetchOrders() - Error response data:", JSON.stringify(error.response.data, null, 2));
      console.error("[OrdersService] fetchOrders() - Error response headers:", error.response.headers);
    } else if (error.request) {
      console.error("[OrdersService] fetchOrders() - Request was made but no response received");
      console.error("[OrdersService] fetchOrders() - Request:", error.request);
    } else {
      console.error("[OrdersService] fetchOrders() - Error setting up request:", error.message);
    }
    console.error("[OrdersService] fetchOrders() - ========== FETCH ORDERS FAILED ==========");
    console.error("=".repeat(80));
    
    // Don't fallback to mock data - return empty array instead
    // This allows the UI to show proper empty state
    if (error.response?.status === 401) {
      console.warn("[OrdersService] fetchOrders() - Unauthorized (401) - User may not be authenticated");
      console.warn("[OrdersService] fetchOrders() - Returning empty orders array");
    return {
      data: {
          orders: [],
        summary: {
            totalOrders: 0,
            delivered: 0,
            processing: 0,
          },
          pagination: {
            count: 0,
            next: null,
            previous: null,
            currentPage: page,
        },
      },
    };
    }
    
    // For other errors, re-throw to be handled by the component
    throw error;
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

