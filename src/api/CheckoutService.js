import API from "../axios";
import { createOrderRecord } from "./orders/OrdersService";

const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

const calculateItemsTotal = (items = []) =>
  items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);

/**
 * Start checkout process - Get available coupons and rewards
 * POST /api/v1/orders/start-checkout/
 * Returns: [{ coupon: "string", rewards: 0 }]
 * @returns {Promise<Object>} Available coupons and rewards
 */
export const startCheckout = async () => {
  try {
    const response = await API.post("/v1/orders/start-checkout/");
    
    // API returns array: [{ coupon: "string", rewards: 0 }]
    const checkoutData = Array.isArray(response.data) ? response.data : [];
    
    // Extract coupons and rewards
    const coupons = checkoutData
      .filter(item => item.coupon)
      .map(item => ({
        code: item.coupon,
        rewards: item.rewards || 0,
      }));
    
    const totalRewards = checkoutData.reduce((sum, item) => sum + (item.rewards || 0), 0);
    
    return {
      data: {
        coupons,
        rewards: totalRewards,
        checkoutData,
      },
    };
  } catch (error) {
    console.error("Error starting checkout:", error);
    // If unauthorized (401), return empty coupons/rewards (guest mode)
    if (error.response?.status === 401) {
      console.log("User not authenticated, no coupons/rewards available");
      return {
        data: {
          coupons: [],
          rewards: 0,
          checkoutData: [],
        },
      };
    }
    return {
      data: {
        coupons: [],
        rewards: 0,
        checkoutData: [],
      },
    };
  }
};

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
        backendFormat: addr.backendFormat,
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

/**
 * Create order directly via API
 * POST /api/v1/orders/
 * @param {Object} payload - Order creation payload
 * @param {Array} payload.items - Cart items
 * @param {Object} payload.addressData - Shipping address (drop_location format)
 * @param {string} payload.orderCode - Order code
 * @param {string} payload.paymentMethod - Payment method
 * @param {number} payload.total - Order total
 * @returns {Promise<Object>} Created order response
 */
export const createOrder = async (payload) => {
  try {
    console.log("[CheckoutService] createOrder() - Starting order creation with payload:", payload);
    const { items = [], addressData = null, orderCode = null, paymentMethod = "card", total = 0 } = payload;
    
    // Generate order code if not provided
    const finalOrderCode = orderCode || `order_${Date.now()}`;
    console.log("[CheckoutService] createOrder() - Order code:", finalOrderCode);
    
    // Transform cart items to API format
    // API expects: item: [{ id: 0, item: { id: 0, product: {...}, ... }, quantity: 0 }]
    const orderItems = items.map((cartItem) => {
      // cartItem has: { id, sku, title, price, qty, image, ... }
      // We need to map to: { id: cart_item_id, item: { id: variation_id, product: {...}, ... }, quantity: qty }
      return {
        id: cartItem.id || 0, // Cart item ID (if available from backend)
        item: {
          id: cartItem.sku || cartItem.id || 0, // Variation ID (item_id)
          product: {
            id: cartItem.productId || 0, // Product ID
            product_name: cartItem.title || cartItem.product_name || "",
            product_description: cartItem.description || cartItem.product_description || "",
            brand: cartItem.brandId || 0,
          },
          product_color: cartItem.color || "",
          product_size: cartItem.size || "",
          product_price: parseFloat(cartItem.price || 0),
          // laptop_product can be added if needed
          product_images: cartItem.image ? [{
            id: 0,
            product_image: cartItem.image
          }] : [],
          get_image_count: "0",
          get_discounted_price: String(cartItem.discountedPrice || cartItem.price || 0),
          stock: String(cartItem.stock || "0"),
        },
        quantity: parseInt(cartItem.qty || 1, 10),
      };
    });
    
    console.log("[CheckoutService] createOrder() - Transformed order items:", orderItems.length);
    
    // Prepare order payload
    const orderPayload = {
      item: orderItems,
      order_date: new Date().toISOString(),
      order_price: parseFloat(total || 0),
      order_code: finalOrderCode,
      order_status: "PENDING",
      payment: [{
        payment_method: paymentMethod,
        payment_date: new Date().toISOString(),
        payment_token: payload.paymentToken || "",
        is_paid: false, // Will be updated when payment is processed
      }],
      drop_location: addressData ? {
        id: addressData.id || 0,
        email: addressData.email || "",
        name: addressData.name || "",
        phone: addressData.phone ? (typeof addressData.phone === 'string' ? parseInt(addressData.phone.replace(/\D/g, ''), 10) : Number(addressData.phone)) : 0,
        full_address: addressData.full_address || "",
        district: addressData.district || "",
        city: addressData.city || "",
        label: addressData.label || "",
      } : null,
      delivered_by: "",
    };
    
    console.log("[CheckoutService] createOrder() - Order payload prepared:", {
      order_code: finalOrderCode,
      item_count: orderItems.length,
      total: orderPayload.order_price,
      has_address: !!addressData
    });
    console.log("[CheckoutService] createOrder() - Making POST request to /v1/orders/");
    
    const response = await API.post("/v1/orders/", orderPayload);
    
    console.log("[CheckoutService] createOrder() - Order created successfully:", {
      status: response.status,
      order_code: response.data?.order_code,
      order_id: response.data?.id
    });
    
    return {
      data: response.data,
    };
  } catch (error) {
    console.error("[CheckoutService] createOrder() - ERROR creating order:", error);
    console.error("[CheckoutService] createOrder() - Error response:", error.response?.data);
    console.error("[CheckoutService] createOrder() - Error status:", error.response?.status);
    throw error;
  }
};

// ====== Order placement ======
// Note: Orders can be created directly via createOrder or through payment flow
// The order is created when payment is processed via /v1/payments/order-payment/
export const placeOrder = async (payload) => {
  try {
    console.log("[CheckoutService] placeOrder() - Starting order placement with payload:", {
      items_count: payload.items?.length || 0,
      paymentMethod: payload.paymentMethod,
      total: payload.total,
      has_address: !!payload.addressData
    });
    
    // Check if this is a dummy payment (paymentIntentId starts with "dummy_")
    const isDummyPayment = payload.paymentIntentId && payload.paymentIntentId.startsWith("dummy_");
    
    // First, create the order via API - THIS IS THE CRITICAL CALL TO STORE ORDER IN BACKEND
    console.log("[CheckoutService] placeOrder() - Creating order in backend...");
    const orderResponse = await createOrder({
      items: payload.items || [],
      addressData: payload.addressData || null,
      orderCode: payload.orderCode || null,
      paymentMethod: payload.paymentMethod || "card",
      total: payload.total || 0,
      paymentToken: payload.paymentIntentId || "",
    });
    
    const orderCode = orderResponse.data?.order_code || orderResponse.data?.id || `order_${Date.now()}`;
    console.log("[CheckoutService] placeOrder() - Order created with code:", orderCode);
    
    // Skip payment processing for dummy payments, COD, or card payments
    // processOrderPayment only supports: esewa, khalti, cod
    // Card payments are handled separately via Stripe
    const skipPaymentProcessing = isDummyPayment || 
                                  payload.paymentMethod === "cod" || 
                                  payload.paymentMethod === "card";
    
    if (skipPaymentProcessing) {
      console.log("[CheckoutService] Skipping payment processing for:", {
        isDummyPayment,
        paymentMethod: payload.paymentMethod,
        reason: isDummyPayment ? "dummy payment" : 
                payload.paymentMethod === "cod" ? "COD" : 
                payload.paymentMethod === "card" ? "card payment (handled separately)" : "unknown"
      });
      
      // Order created successfully - return success response
      // Cart will be cleared by OrderConfirmationPage after confirmation
      console.log("[CheckoutService] placeOrder() - Order created successfully, cart should be cleared");
      return {
        data: {
          orderId: orderCode,
          order: orderResponse.data,
          status: "succeeded",
          message: "Order placed successfully",
        },
      };
    }
    
    // Then process payment which updates the order (only for esewa, khalti, etc.)
    const { processOrderPayment } = await import("./payment/PaymentService");
    
    try {
      // Process order payment - this will throw if it fails
      await processOrderPayment({
        payment_method: payload.paymentMethod || "cod",
        amount: String(payload.total),
        order_code: orderCode,
        ref_code: payload.paymentIntentId || "",
        pidx: payload.paymentIntentId || "",
        // Include address data for shipping
        shipping_address: payload.addressData,
      });
    } catch (paymentError) {
      console.error("[CheckoutService] Payment processing failed:", paymentError);
      // Re-throw the error for non-card payment methods
      throw paymentError;
    }
    
    // Return order details
    return {
      data: {
        orderId: orderCode,
        order: orderResponse.data,
        status: "succeeded",
        message: "Order placed successfully",
      },
    };
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
};
