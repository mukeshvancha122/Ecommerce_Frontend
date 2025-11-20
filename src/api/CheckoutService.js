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
  await delay();
  return {
    data: {
      addresses: [
        {
          id: "addr_1",
          fullName: "Mukesh Reddy",
          phone: "9441282440",
          address1: "103, 5-55/3/1, Vajra Residency, Mallikarjun Nagar",
          address2: "Buddha Nagar, Boduppal",
          city: "HYDERABAD",
          state: "TELANGANA",
          zip: "500092",
          country: "India",
          isDefault: true,
        },
        {
          id: "addr_2",
          fullName: "Mukesh Reddy",
          phone: "9949687659",
          address1: "301, Sai Ganga Residency, GFG9+9g4, Pipe Line Rd",
          address2: "Sri Ram Nagar, Jeedimetla",
          city: "HYDERABAD",
          state: "TELANGANA",
          zip: "500055",
          country: "India",
          isDefault: false,
        },
        {
          id: "addr_3",
          fullName: "Mukesh Reddy",
          phone: "9182513118",
          address1: "H.No. 4-5-135/33, Sriram Nagar Colony, Nacharam",
          address2: "",
          city: "HYDERABAD",
          state: "TELANGANA",
          zip: "500076",
          country: "India",
          isDefault: false,
        },
      ],
    },
  };
};

export const addAddress = async (payload) => {
  await delay();
  return {
    data: {
      address: {
        id: "addr_" + Math.floor(Math.random() * 10000),
        ...payload,
        isDefault: false,
      },
    },
  };
};

export const updateAddress = async (id, payload) => {
  await delay();
  return { data: { address: { id, ...payload } } };
};

export const setDefaultAddress = async (id) => {
  await delay();
  return { data: { success: true, id } };
};

// ====== Shipping Quote ======
export const getShippingQuote = async () => {
  await delay();
  const itemsTotal = 89.99;
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
export const placeOrder = async (payload) => {
  await delay(800);
  const order = {
    id: payload.paymentIntentId || `order_${Date.now()}`,
    status: "succeeded",
    paymentIntentId: payload.paymentIntentId,
    addressId: payload.addressId,
    items: payload.items,
    total: payload.total,
    placedAt: new Date().toISOString(),
    paymentMethod: payload.paymentMethod || "card",
  };
  await createOrderRecord(order);
  return {
    data: {
      orderId: order.id,
      status: order.status,
      message: "Order placed successfully (mock)",
    },
  };
};
