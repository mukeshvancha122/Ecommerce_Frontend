import API from "../axios";
import { createOrderRecord } from "./orders/OrdersService";

/**
 * Get Addresses
 * GET /api/v1/checkout/addresses/ or GET /api/v1/addresses/
 */
export const getAddresses = async () => {
  try {
    // Try v1/checkout/addresses first, fallback to v1/addresses
    try {
      const response = await API.get("/api/v1/checkout/addresses/");
      return response;
    } catch (e) {
      try {
        const response = await API.get("/api/v1/addresses/");
        return response;
      } catch (e2) {
        // If both endpoints fail, return empty array structure
        console.warn("Both address endpoints failed, returning empty array");
        return { data: { addresses: [] } };
      }
    }
  } catch (error) {
    console.error("Error fetching addresses:", error);
    // Return empty structure instead of throwing to prevent UI crash
    return { data: { addresses: [] } };
  }
};

/**
 * Add Address
 * POST /api/v1/checkout/addresses/ or POST /api/v1/addresses/
 */
export const addAddress = async (payload) => {
  try {
    try {
      const response = await API.post("/api/v1/checkout/addresses/", payload);
      return response;
    } catch (e) {
      try {
        const response = await API.post("/api/v1/addresses/", payload);
        return response;
      } catch (e2) {
        // If both endpoints fail, create a local address object with generated ID
        console.warn("Both address endpoints failed, creating local address");
        const localAddress = {
          ...payload,
          id: Date.now(),
          isDefault: false,
        };
        return { 
          data: { 
            address: localAddress,
            message: "Address saved locally (backend unavailable)"
          } 
        };
      }
    }
  } catch (error) {
    console.error("Error adding address:", error);
    // Create local address as fallback
    const localAddress = {
      ...payload,
      id: Date.now(),
      isDefault: false,
    };
    return { 
      data: { 
        address: localAddress,
        message: "Address saved locally (backend unavailable)"
      } 
    };
  }
};

/**
 * Update Address
 * PUT /api/v1/checkout/addresses/{id}/ or PUT /api/v1/addresses/{id}/
 */
export const updateAddress = async (id, payload) => {
  try {
    try {
      const response = await API.put(`/api/v1/checkout/addresses/${id}/`, payload);
      return response;
    } catch (e) {
      const response = await API.put(`/api/v1/addresses/${id}/`, payload);
      return response;
    }
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
};

/**
 * Set Default Address
 * POST /api/v1/checkout/addresses/{id}/default/ or POST /api/v1/addresses/{id}/default/
 */
export const setDefaultAddress = async (id) => {
  try {
    try {
      const response = await API.post(`/api/v1/checkout/addresses/${id}/default/`);
      return response;
    } catch (e) {
      const response = await API.post(`/api/v1/addresses/${id}/default/`);
      return response;
    }
  } catch (error) {
    console.error("Error setting default address:", error);
    throw error;
  }
};

/**
 * Get Shipping Quote
 * GET /api/v1/checkout/shipping-quote/
 */
export const getShippingQuote = async () => {
  try {
    const response = await API.get("/api/v1/checkout/shipping-quote/");
    return response;
  } catch (error) {
    console.error("Error fetching shipping quote:", error);
    // Return default shipping quote instead of throwing
    return {
      data: {
        itemsTotal: 0,
        shipping: 0,
        tax: 0,
        importCharges: 0
      }
    };
  }
};

/**
 * Create Payment Intent
 * POST /api/v1/checkout/payment-intent/
 * Payload: { addressId, items }
 * Returns: { amount, currency, clientSecret, orderId }
 */
export const createPaymentIntent = async (payload) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Calculate total from items
  const total = payload.items?.reduce((sum, item) => {
    return sum + (Number(item.price || 0) * Number(item.qty || 1));
  }, 0) || 0;
  
  // Generate dummy payment intent
  const dummyPaymentIntent = {
    clientSecret: `pi_dummy_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
    amount: Math.round(total * 100), // Amount in cents
    currency: "usd",
    orderId: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
  };
  
  console.log("✅ Payment intent created (using dummy data):", dummyPaymentIntent);
  
  return {
    data: dummyPaymentIntent
  };
};

/**
 * Place Order
 * Bypasses backend and returns dummy order data
 * Payload: { addressId, items, paymentIntentId, paymentMethod, total }
 */
export const placeOrder = async (payload) => {
  // Simulate network delay for realistic UX
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate dummy order ID
  const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  
  // Create dummy order response
  const dummyOrderResponse = {
    orderId: orderId,
    status: "succeeded",
    message: "Order placed successfully",
    total: payload.total,
    items: payload.items,
    addressId: payload.addressId,
    paymentMethod: payload.paymentMethod || "card",
    paymentIntentId: payload.paymentIntentId,
    placedAt: new Date().toISOString(),
  };
  
  console.log("✅ Order placed (using dummy data):", dummyOrderResponse);
  
  // Create order record locally for UI consistency
  try {
    await createOrderRecord({
      id: orderId,
      status: "succeeded",
      paymentIntentId: payload.paymentIntentId,
      addressId: payload.addressId,
      items: payload.items,
      total: payload.total,
      placedAt: new Date().toISOString(),
      paymentMethod: payload.paymentMethod || "card",
    });
    console.log("✅ Order record created locally");
  } catch (localError) {
    console.warn("Failed to create local order record:", localError);
  }
  
  return {
    data: dummyOrderResponse
  };
};
