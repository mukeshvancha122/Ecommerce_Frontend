import API from "../../axios";

const ORDERS_ENDPOINT = "/v1/orders/current-order/";

const buildOrdersEndpoint = (options = {}) => {
  const params = new URLSearchParams();
  const normalizedPage = Number(options.page) || 1;
  params.set("page", normalizedPage);

  const searchValue = options.searchQuery ?? options.search;
  if (searchValue) {
    params.set("search", searchValue);
  }

  const orderCodeValue = options.orderCode ?? options.order_code;
  if (orderCodeValue) {
    params.set("order_code", orderCodeValue);
  }

  const query = params.toString();
  return query ? `${ORDERS_ENDPOINT}?${query}` : ORDERS_ENDPOINT;
};

// Normalize backend response so we always work with an array of orders
const extractOrders = (responseData) => {
  if (!responseData) return [];
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData.data)) return responseData.data;
  if (Array.isArray(responseData.results)) return responseData.results;
  if (Array.isArray(responseData.orders)) return responseData.orders;
  if (Array.isArray(responseData.results?.data)) return responseData.results.data;
  return [];
};


const transformOrders = (rawOrders = []) => {
  const statusMap = {
    PENDING: "Processing",
    CONFIRMED: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };

  return rawOrders.map((apiOrder) => {
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
        discountedPrice: parseFloat(
          orderItem.item?.get_discounted_price?.final_price ?? orderItem.item?.product_price ?? 0
        ),
        stock: orderItem.item?.stock?.quantity || orderItem.item?.stock || "0",
      };
    });

    const payment = apiOrder.payment?.[0] || {};
    const paymentMethod = payment.payment_method || "card";
    const dropLocation = apiOrder.drop_location || {};
    const rawStatus = (apiOrder.order_status || "PENDING").toUpperCase();

    return {
      id: apiOrder.order_code || apiOrder.id,
      order_code: apiOrder.order_code,
      orderId: apiOrder.order_code,
      placedAt: apiOrder.order_date,
      created_at: apiOrder.order_date,
      order_date: apiOrder.order_date,
      total: parseFloat(apiOrder.order_price || 0),
      order_price: parseFloat(apiOrder.order_price || 0),
      status: statusMap[rawStatus] || apiOrder.order_status || "Processing",
      order_status: apiOrder.order_status || "PENDING",
      paymentMethod,
      payment_method: paymentMethod,
      payment: apiOrder.payment || [],
      items,
      addressId: dropLocation.id ? String(dropLocation.id) : null,
      drop_location: dropLocation,
      delivered_by: apiOrder.delivered_by || "",
      fulfillment: {
        lastUpdate: apiOrder.order_status || "Processing",
        trackingId: apiOrder.order_code || "",
        expectedBy: apiOrder.delivered_by?.delivery_end || apiOrder.order_date || null,
      },
      actions: ["Buy it again", "Return or replace items", "Get invoice"],
    };
  });
};

const buildPaginationMeta = (responseData, currentPage = 1) => {
  const paginationFromResponse = responseData?.pagination || {};
  const possibleCounts = [
    responseData?.count,
    paginationFromResponse.count,
    Array.isArray(responseData?.data) ? responseData.data.length : null,
    Array.isArray(responseData?.results) ? responseData.results.length : null,
    Array.isArray(responseData?.orders) ? responseData.orders.length : null,
  ];

  let resolvedCount = 0;
  for (const value of possibleCounts) {
    if (typeof value === "number" && !Number.isNaN(value)) {
      resolvedCount = value;
      break;
    }
  }

  return {
    count: resolvedCount,
    next:
      responseData?.next ??
      responseData?.links?.next ??
      paginationFromResponse.next ??
      null,
    previous:
      responseData?.previous ??
      responseData?.links?.previous ??
      paginationFromResponse.previous ??
      null,
    currentPage: paginationFromResponse.currentPage || Number(currentPage) || 1,
  };
};

export const fetchOrders = async (options = {}) => {
  try {
    const endpoint = buildOrdersEndpoint(options);
    console.log("[OrdersService] fetchOrders() - Requesting", endpoint);
    const response = await API.get(endpoint);
    console.log("[OrdersService] fetchOrders() - Response status:", response.status);
    const responseData = response.data;
    const rawOrders = extractOrders(responseData);
    console.log("[OrdersService] fetchOrders() - Raw orders count:", rawOrders.length);

    const orders = transformOrders(rawOrders);
    const summary = {
      totalOrders: orders.length,
      delivered: orders.filter((o) => o.status === "Delivered" || o.status === "delivered").length,
      processing: orders.filter((o) => o.status !== "Delivered" && o.status !== "delivered").length,
    };

    return {
      data: {
        orders,
        summary,
        pagination: buildPaginationMeta(responseData, options.page || 1),
      },
      rawApiResponse: responseData,
    };
  } catch (error) {
    console.error("[OrdersService] fetchOrders() - Error fetching orders:", error);
    throw error;
  }
};
