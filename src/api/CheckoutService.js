// import API from "../axios"; // your configured axios instance

// export const getAddresses = () => API.get("/addresses");               // -> {addresses: []}
// export const addAddress = (payload) => API.post("/addresses", payload); // -> {address}
// export const updateAddress = (id, payload) => API.put(`/addresses/${id}`, payload);
// export const setDefaultAddress = (id) => API.post(`/addresses/${id}/default`);

// export const getShippingQuote = () => API.get("/checkout/shipping-quote"); // -> {shipping, tax, importCharges}
// export const createPaymentIntent = (payload) =>
//   API.post("/checkout/payment-intent", payload); // {amount, currency, clientSecret, orderId}

// export const placeOrder = (payload) => API.post("/checkout/place-order", payload);
// // payload: { addressId, items, paymentIntentId }
// src/api/checkout.js
import API from "../axios";
import { createOrderRecord } from "./orders/OrdersService";

// ======= TEMPORARY MOCK IMPLEMENTATION =======
// Comment these out once you connect real backend.

const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

const calculateItemsTotal = (items = []) =>
  items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);

export const getAddresses = async () => {
  // Load from localStorage instead of API
  const savedAddresses = loadSavedAddresses();
  
  return {
    data: {
      addresses: savedAddresses.map(addr => ({
        id: addr.id,
        fullName: addr.fullName || addr.name || "",
        phone: String(addr.phone || ""),
        address1: addr.address1 || addr.full_address || "",
        address2: addr.address2 || "",
        city: addr.city || "",
        state: addr.state || addr.district || "",
        district: addr.district || addr.state || "",
        zip: addr.zip || "",
        country: addr.country || "India",
        email: addr.email || "",
        label: addr.label || addr.fullName || "",
        backendFormat: addr.backendFormat, // Keep backend format for shipping
      })),
    },
  };
};

// Store addresses locally (bypass backend for now)
const STORAGE_KEY = "saved_addresses_v1";

const loadSavedAddresses = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error("Error loading saved addresses:", err);
    return [];
  }
};

const saveAddresses = (addresses) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  } catch (err) {
    console.error("Error saving addresses:", err);
  }
};

export const addAddress = async (payload) => {
  // Map frontend format to backend format
  // Backend expects: { email, name, phone (number), full_address, district, city, label }
  // Clean and normalize all values
  const cleanString = (str) => {
    if (!str) return "";
    return String(str).trim().replace(/[""]/g, '"').replace(/['']/g, "'");
  };
  
  const districtValue = cleanString(payload.district || payload.state || "");
  const cityValue = cleanString(payload.city || "");
  
  // Validate email is provided
  const email = cleanString(payload.email || "");
  if (!email || !email.trim()) {
    throw new Error("Email is required to create an address");
  }
  
  // Create address object (stored locally, not sent to backend)
  const addressId = `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const address = {
    id: addressId,
    fullName: cleanString(payload.fullName || ""),
    phone: String(payload.phone || ""),
    address1: cleanString(payload.address1 || ""),
    address2: cleanString(payload.address2 || ""),
    city: cityValue,
    state: districtValue, // Using state field for district
    district: districtValue, // Also store as district for backend format
    zip: cleanString(payload.zip || ""),
    country: payload.country || "India",
    email: email,
    label: cleanString(payload.label || payload.fullName || ""),
    // Store backend format for when we need to send it
    backendFormat: {
      email: email,
      name: cleanString(payload.fullName || ""),
      phone: payload.phone ? (typeof payload.phone === 'string' ? parseInt(payload.phone.replace(/\D/g, ''), 10) : Number(payload.phone)) : 0,
      full_address: cleanString(`${payload.address1 || ""} ${payload.address2 || ""}`),
      district: districtValue,
      city: cityValue,
      label: cleanString(payload.label || payload.fullName || ""),
    },
  };
  
  // Save to localStorage
  const savedAddresses = loadSavedAddresses();
  savedAddresses.push(address);
  saveAddresses(savedAddresses);
  
  console.log("Address saved locally:", address);
  
  return {
    data: {
      address,
    },
  };
};

export const updateAddress = async (id, payload) => {
  const cleanString = (str) => {
    if (!str) return "";
    return String(str).trim().replace(/[""]/g, '"').replace(/['']/g, "'");
  };
  
  const districtValue = cleanString(payload.district || payload.state || "");
  const cityValue = cleanString(payload.city || "");
  
  // Load and update in localStorage
  const savedAddresses = loadSavedAddresses();
  const index = savedAddresses.findIndex(addr => addr.id === id);
  
  if (index !== -1) {
    const updatedAddress = {
      ...savedAddresses[index],
      ...payload,
      city: cityValue,
      state: districtValue,
      district: districtValue,
      backendFormat: {
        email: cleanString(payload.email || ""),
        name: cleanString(payload.fullName || ""),
        phone: payload.phone ? (typeof payload.phone === 'string' ? parseInt(payload.phone.replace(/\D/g, ''), 10) : Number(payload.phone)) : 0,
        full_address: cleanString(`${payload.address1 || ""} ${payload.address2 || ""}`),
        district: districtValue,
        city: cityValue,
        label: cleanString(payload.label || payload.fullName || ""),
      },
    };
    
    savedAddresses[index] = updatedAddress;
    saveAddresses(savedAddresses);
    
    return { data: { address: updatedAddress } };
  }
  
  return { data: { address: { id, ...payload } } };
};

export const setDefaultAddress = async (id) => {
  await delay();
  return { data: { success: true, id } };
};

// ====== Shipping Quote ======
// Accept address data to include in shipping calculation
export const getShippingQuote = async (addressData = null) => {
  // If address data is provided, we can include it in the request
  // For now, using mock data but address can be sent to backend if needed
  const itemsTotal = 89.99;
  
  // If address is provided, log it for future backend integration
  if (addressData) {
    console.log("Shipping quote requested with address:", addressData);
    // Future: Include address in API call
    // const response = await API.post("/v1/orders/shipping-quote/", { address: addressData });
  }
  
  return {
    data: {
      itemsTotal,
      shipping: 52.31,
      tax: 0.0,
      importCharges: 59.88,
    },
  };
};

// ====== Payment ======
export const createPaymentIntent = async (payload) => {
  await delay(1000);
  const itemsTotal = calculateItemsTotal(payload?.items);
  const amount =
    itemsTotal + 52.31 + 0 + 59.88; // include mock shipping/tax to align with UI summary
  return {
    data: {
      clientSecret: "pi_mock_client_secret_12345",
      currency: "USD",
      amount: Math.round(amount * 100) / 100,
      orderId: "order_" + Date.now(),
    },
  };
};

// ====== Order placement ======
// Note: Orders are created through the payment flow, not a separate endpoint
// The order is created when payment is processed via /v1/payments/order-payment/
export const placeOrder = async (payload) => {
  // Process payment which creates the order
  const { processOrderPayment } = await import("./payment/PaymentService");
  
  const orderCode = `order_${Date.now()}`;
  
  // Get address data to include in order
  const addressData = payload.addressData || null;
  
  // Map payment methods to API-supported methods
  // Only call processOrderPayment for methods supported by /api/v1/payments/order-payment/
  // Stripe payments use a different endpoint (/api/v1/payments/stripe-payment/)
  const paymentMethod = payload.paymentMethod || "card";
  const supportedMethods = ["esewa", "khalti", "cod"];
  
  // Only process order payment for supported methods
  // For Stripe/Card, payment is handled separately via stripe-payment endpoint
  if (supportedMethods.includes(paymentMethod.toLowerCase())) {
    await processOrderPayment({
      payment_method: paymentMethod.toLowerCase(),
      amount: String(payload.total),
      order_code: orderCode,
      ref_code: payload.paymentIntentId || "",
      pidx: payload.paymentIntentId || "",
    });
  } else {
    console.log(`[CheckoutService] Skipping order-payment for method: ${paymentMethod} (not supported by order-payment endpoint)`);
  }
  
  // Return order details only if payment succeeds
  return {
    data: {
      orderId: orderCode,
      status: "succeeded",
      message: "Order placed successfully",
    },
  };
};
