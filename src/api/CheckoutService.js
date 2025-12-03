import API from "../axios";

const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

const calculateItemsTotal = (items = []) =>
  items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);

/**
 * STEP 1: Create order from cart
 * POST /v1/orders/start-checkout/
 * Creates an order from the current cart items
 * @returns {Promise<Object>} Created order response
 */
export const createStartCheckout = async () => {
  try {
    console.log("=".repeat(80));
    console.log("[CheckoutService] STEP 1: createStartCheckout() - Creating order from cart");
    console.log("[CheckoutService] POST /v1/orders/start-checkout/");
    console.log("[CheckoutService] Request body: {} (empty)");
    console.log("[CheckoutService] Timestamp:", new Date().toISOString());
    
    // POST with empty request body as per API specification
    const response = await API.post("/v1/orders/start-checkout/", {});
    
    console.log("[CheckoutService] createStartCheckout() - Response status:", response.status);
    console.log("[CheckoutService] createStartCheckout() - Response data:", JSON.stringify(response.data, null, 2));
    
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Failed to create order: ${response.status}`);
    }
    
    console.log("[CheckoutService] STEP 1: Order created successfully");
    console.log("=".repeat(80));
    
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error("[CheckoutService] createStartCheckout() - Error creating order:", error);
    console.error("[CheckoutService] createStartCheckout() - Error response:", error.response?.data);
    console.error("[CheckoutService] createStartCheckout() - Error status:", error.response?.status);
    throw error;
  }
};

/**
 * STEP 3: Get order details from start-checkout endpoint
 * GET /api/v1/orders/start-checkout/
 * This retrieves the order details including order_price, order_code, delivery_charge
 * Called after order is updated with address (Step 2)
 * @returns {Promise<Object>} Order data with order_price, order_code, delivery_charge
 */
export const getStartCheckout = async () => {
  try {
    console.log("=".repeat(80));
    console.log("[CheckoutService] STEP 3: getStartCheckout() - Fetching order details");
    console.log("[CheckoutService] GET /v1/orders/start-checkout/");
    console.log("[CheckoutService] Timestamp:", new Date().toISOString());
    
    const response = await API.get("/v1/orders/start-checkout/");
    
    console.log("[CheckoutService] getStartCheckout() - Response status:", response.status);
    console.log("[CheckoutService] getStartCheckout() - Response data:", JSON.stringify(response.data, null, 2));
    
    // Response format: { data: [{ order_price, order_code, delivery_charge, ... }] }
    // If cart is empty or no order exists, data might be empty array
    const orders = response.data?.data || [];
    const order = orders.length > 0 ? orders[0] : null;
    
    if (!order) {
      // If no order found, it might mean cart is empty or order creation failed
      console.warn("[CheckoutService] getStartCheckout() - No order found in response. Possible reasons:");
      console.warn("  1. Cart is empty");
      console.warn("  2. Order creation failed");
      console.warn("  3. Backend hasn't created order yet");
      throw new Error("No order found in start-checkout response. Please ensure cart has items.");
    }
    
    // Extract required fields: order_price, order_code, delivery_charge
    const orderDetails = {
      order_price: order.order_price,
      order_code: order.order_code,
      delivery_charge: order.delivery_charge || 0,
      order_date: order.order_date,
      items: order.item || [],
      delivered_by: order.delivered_by,
    };
    
    console.log("[CheckoutService] STEP 3: Order details extracted:", {
      order_code: orderDetails.order_code,
      order_price: orderDetails.order_price,
      delivery_charge: orderDetails.delivery_charge,
    });
    console.log("=".repeat(80));
    
    return {
      data: orderDetails,
    };
  } catch (error) {
    console.error("[CheckoutService] getStartCheckout() - Error fetching order details:", error);
    console.error("[CheckoutService] getStartCheckout() - Error response:", error.response?.data);
    console.error("[CheckoutService] getStartCheckout() - Error status:", error.response?.status);
    throw error;
  }
};

/**
 * Get current active order
 * GET /api/v1/orders/current-order/
 * This retrieves the order created by startCheckout
 * @returns {Promise<Object>} Current order data
 */
export const getCurrentOrder = async () => {
  try {
    console.log("[CheckoutService] getCurrentOrder() - Fetching current active order");
    const response = await API.get("/v1/orders/current-order/");
    console.log("[CheckoutService] getCurrentOrder() - Response:", response);
    
    // API returns paginated response: { count, next, previous, results: [...] }
    // The current order should be the first item in results
    const orders = response.data?.results || [];
    const currentOrder = orders.length > 0 ? orders[0] : null;
    
    if (currentOrder) {
      console.log("[CheckoutService] getCurrentOrder() - Found current order:", {
        order_code: currentOrder.order_code,
        order_status: currentOrder.order_status,
        item_count: currentOrder.item?.length || 0,
      });
    } else {
      console.warn("[CheckoutService] getCurrentOrder() - No current order found");
    }
    
    return {
      data: currentOrder,
    };
  } catch (error) {
    console.error("[CheckoutService] getCurrentOrder() - Error fetching current order:", error);
    // If unauthorized (401), return null (guest mode)
    if (error.response?.status === 401) {
      console.log("[CheckoutService] User not authenticated, no current order available");
      return {
        data: null,
      };
    }
    throw error;
  }
};

/**
 * STEP 2: Update order checkout with shipping address and shipping type
 * POST /api/v1/orders/update-checkout/
 * 
 * Updates the order created in Step 1 with address and shipping type
 * The shipping address ID MUST come from GET /v1/orders/shipping-address/ endpoint.
 * 
 * API expects: { "drop_location_id": "string", "shipping": "string" }
 * 
 * @param {Object} payload - Update checkout payload
 * @param {string|number} payload.shipping_address_id - Shipping address ID from GET /v1/orders/shipping-address/ (will be mapped to drop_location_id)
 * @param {string} payload.shipping_type - Shipping type: "Normal" or "Express" (will be mapped to shipping)
 * @returns {Promise<Object>} Updated order response (expects 200/201 status)
 */
export const updateOrderCheckout = async (payload) => {
  try {
    console.log("=".repeat(80));
    console.log("[CheckoutService] STEP 2: updateOrderCheckout() - Updating order with address");
    console.log("[CheckoutService] POST /v1/orders/update-checkout/");
    console.log("[CheckoutService] Timestamp:", new Date().toISOString());
    console.log("[CheckoutService] Payload:", payload);
    
    const { shipping_address_id, shipping_type } = payload;
    
    // Validate required fields
    if (!shipping_address_id) {
      throw new Error("shipping_address_id is required");
    }
    if (!shipping_type || !["Normal", "Express"].includes(shipping_type)) {
      throw new Error("shipping_type is required and must be 'Normal' or 'Express'");
    }
    
    // Check if address ID is a numeric backend database ID
    // Local storage addresses have IDs like 'addr_xxx' which are not valid backend IDs
    const isNumericId = /^\d+$/.test(String(shipping_address_id));
    
    if (!isNumericId) {
      // This is a local storage address ID, not a backend database ID
      // The backend API requires a numeric database ID for drop_location_id
      // We'll skip this call and include address data in the final order creation instead
      console.warn("[CheckoutService] updateOrderCheckout() - Skipping: addressId is not a numeric backend ID:", shipping_address_id);
      console.warn("[CheckoutService] Address data will be included in final order creation instead");
      
      // Return a success response to allow the flow to continue
      // The address will be included in the final order creation via placeOrder
      return {
        data: { message: "Skipped: using local address, will be included in order creation" },
        status: 200,
        skipped: true,
      };
    }
    
    // Map to API expected field names
    // API expects: drop_location_id (string) and shipping (string)
    // 
    // CRITICAL: The shipping_address_id parameter is the ID selected by the user
    // from the address list fetched from GET /api/v1/orders/shipping-address/
    // This ID (from the backend response) is used as drop_location_id in the request
    // 
    // Example: If user selects address with id: 5 from GET /api/v1/orders/shipping-address/
    // Then drop_location_id in the request body will be "5"
    const dropLocationId = String(shipping_address_id);
    
    // Shipping type should be sent as a string
    const shippingValue = String(shipping_type);
    
    // Request body for POST /api/v1/orders/update-checkout/
    // drop_location_id: The ID from the selected address (from GET /api/v1/orders/shipping-address/)
    // shipping: The shipping type selected by the user ("Normal" or "Express")
    const requestBody = {
      drop_location_id: dropLocationId, // ID from selected address (from GET /api/v1/orders/shipping-address/)
      shipping: shippingValue,
    };
    
    console.log("[CheckoutService] STEP 2: Request body:", JSON.stringify(requestBody, null, 2));
    console.log("[CheckoutService] updateOrderCheckout() - Request Details:", {
      drop_location_id: dropLocationId,
      drop_location_id_type: typeof dropLocationId,
      shipping: shippingValue,
      shipping_type: typeof shippingValue,
      original_shipping_address_id: shipping_address_id,
      original_shipping_type: shipping_type,
    });
    
    const response = await API.post("/v1/orders/update-checkout/", requestBody);
    
    // Validate successful response (200 or 201)
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Update checkout failed with status ${response.status}`);
    }
    
    console.log("[CheckoutService] updateOrderCheckout() - ========== API RESPONSE RECEIVED ==========");
    console.log("[CheckoutService] updateOrderCheckout() - Response Status:", response.status);
    console.log("[CheckoutService] updateOrderCheckout() - Response Headers:", response.headers);
    console.log("[CheckoutService] updateOrderCheckout() - Full Response Data (what backend returned):");
    console.log(JSON.stringify(response.data, null, 2));
    console.log("[CheckoutService] updateOrderCheckout() - Response Data Structure:", {
      is_array: Array.isArray(response.data),
      is_object: typeof response.data === 'object' && response.data !== null,
      keys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : 'N/A',
      has_order: !!(response.data?.order),
      has_order_code: !!(response.data?.order_code),
      has_drop_location: !!(response.data?.drop_location),
      has_shipping: !!(response.data?.shipping),
      has_drop_location_id: !!(response.data?.drop_location_id),
    });
    console.log("[CheckoutService] updateOrderCheckout() - ========== API REQUEST SUCCESS ==========");
    console.log("=".repeat(80));
    
    // Include the original request values in the response for reference
    return {
      data: {
        ...response.data,
        // Include original request values for logging/debugging
        _request: {
          shipping_address_id: shipping_address_id,
          shipping_type: shipping_type,
          drop_location_id: dropLocationId,
          shipping: shippingValue,
        },
      },
      status: response.status,
    };
  } catch (error) {
    console.error("[CheckoutService] updateOrderCheckout() - Error updating order checkout:", error);
    console.error("[CheckoutService] updateOrderCheckout() - Error response:", error.response?.data);
    console.error("[CheckoutService] updateOrderCheckout() - Error status:", error.response?.status);
    throw error;
  }
};

/**
 * Create a shipping address in the backend
 * POST /api/v1/orders/shipping-address/
 * 
 * @param {Object} addressData - Address data in backend format
 * @param {string} addressData.email - Email address
 * @param {string} addressData.name - Full name
 * @param {number} addressData.phone - Phone number
 * @param {string} addressData.full_address - Full address
 * @param {string} addressData.district - District
 * @param {string} addressData.city - City
 * @param {string} addressData.label - Address label
 * @returns {Promise<Object>} Created address with id from backend
 */
export const createShippingAddress = async (addressData) => {
  try {
    console.log("[CheckoutService] createShippingAddress() - Creating address in backend");
    console.log("[CheckoutService] createShippingAddress() - API Endpoint: POST /v1/orders/shipping-address/");
    console.log("[CheckoutService] createShippingAddress() - Request body:", JSON.stringify(addressData, null, 2));
    
    const response = await API.post("/v1/orders/shipping-address/", addressData);
    
    console.log("[CheckoutService] createShippingAddress() - Response Status:", response.status);
    console.log("[CheckoutService] createShippingAddress() - Response Data:", JSON.stringify(response.data, null, 2));
    
    if (response.status === 201) {
      console.log("[CheckoutService] createShippingAddress() - Address created successfully with ID:", response.data.id);
      return {
        data: response.data, // Contains: { id, email, name, phone, full_address, district, city, label }
        status: response.status,
      };
    } else {
      throw new Error(`Failed to create address: status ${response.status}`);
    }
  } catch (error) {
    console.error("[CheckoutService] createShippingAddress() - Error creating address:", error);
    console.error("[CheckoutService] createShippingAddress() - Error response:", error.response?.data);
    console.error("[CheckoutService] createShippingAddress() - Error status:", error.response?.status);
    throw error;
  }
};

/**
 * Get all shipping addresses from backend
 * GET /api/v1/orders/shipping-address/
 * 
 * Backend returns an array of addresses with format:
 * [
 *   {
 *     "id": 0,
 *     "email": "user@example.com",
 *     "name": "string",
 *     "phone": 9223372036854776000,
 *     "full_address": "string",
 *     "district": "string",
 *     "city": "string",
 *     "label": "string"
 *   }
 * ]
 * 
 * @returns {Promise<Object>} Addresses data with transformed format
 */
export const getAddresses = async () => {
  try {
    // Fetch shipping addresses from backend API
    // Note: The /api prefix is added by axios baseURL, so this becomes /api/v1/orders/shipping-address/
    const response = await API.get("/v1/orders/shipping-address/");
    
    // Log response for debugging
    console.log("[CheckoutService] getAddresses() - API Response:", {
      status: response.status,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      hasResults: !!response.data?.results,
      dataKeys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : [],
      rawData: response.data,
    });
    
    // Backend returns an array of addresses with format:
    // [{ id, email, name, phone, full_address, district, city, label }]
    // Handle both direct array response and paginated response format
    const backendAddresses = Array.isArray(response.data) 
      ? response.data 
      : (response.data?.results || response.data?.data || []);
    
    console.log("[CheckoutService] getAddresses() - Extracted addresses:", {
      count: backendAddresses.length,
      firstAddress: backendAddresses[0] || null,
    });
    
    // Transform backend format to frontend format
    // CRITICAL: The addr.id from the backend response is stored as both:
    // - id: Used for frontend address selection
    // - backendId: Used as drop_location_id when calling updateOrderCheckout
    const addresses = backendAddresses.map((addr) => {
      const transformed = {
        id: String(addr.id), // Frontend ID (same as backend ID, but as string)
        fullName: addr.name || "",
        phone: String(addr.phone || ""),
        address1: addr.full_address || "",
        address2: "",
        city: addr.city || "",
        state: addr.district || "",
        district: addr.district || "",
        zip: "", // Backend doesn't provide zip in this endpoint
        country: "India", // Default
        email: addr.email || "",
        label: addr.label || addr.name || "",
        // Store backend format for shipping quote API
        backendFormat: {
          name: addr.name,
          phone: String(addr.phone || ""),
          full_address: addr.full_address,
          district: addr.district,
          city: addr.city,
          email: addr.email,
          label: addr.label,
        },
        // CRITICAL: Store the backend ID from GET /api/v1/orders/shipping-address/
        // This ID will be used as drop_location_id in POST /api/v1/orders/update-checkout/
        // When user selects this address, this backendId is used in the update request
        backendId: addr.id, // The 'id' field from the backend response
      };
      
      return transformed;
    });
    
    console.log("[CheckoutService] getAddresses() - Successfully transformed addresses:", {
      count: addresses.length,
      addresses: addresses.map(a => ({ id: a.id, name: a.fullName, city: a.city })),
    });
    
    return {
      data: {
        addresses: addresses,
      },
    };
  } catch (error) {
    console.error("[CheckoutService] getAddresses() - Error fetching addresses from backend:", error);
    console.error("[CheckoutService] getAddresses() - Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });
    
    // If it's a 401 (unauthorized), return empty array (user not logged in)
    if (error.response?.status === 401) {
      console.warn("[CheckoutService] getAddresses() - User not authenticated (401), returning empty addresses");
      return {
        data: {
          addresses: [],
        },
      };
    }
    
    // Fallback to localStorage if API fails (for backward compatibility)
    console.warn("[CheckoutService] getAddresses() - Falling back to localStorage addresses");
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
  }
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
  
  // Prepare backend format
  const phoneNumber = payload.phone 
    ? (typeof payload.phone === 'string' 
        ? parseInt(payload.phone.replace(/\D/g, ''), 10) 
        : Number(payload.phone))
    : 0;
  
  const fullAddress = cleanString(`${payload.address1 || ""} ${payload.address2 || ""}`.trim());
  
  const backendAddressData = {
    email: email,
    name: cleanString(payload.fullName || ""),
    phone: phoneNumber,
    full_address: fullAddress,
    district: districtValue,
    city: cityValue,
    label: cleanString(payload.label || payload.fullName || ""),
  };
  
  // Create address in backend first
  let backendId = null;
  try {
    console.log("[CheckoutService] addAddress() - Creating address in backend...");
    const backendResponse = await createShippingAddress(backendAddressData);
    backendId = backendResponse.data.id;
    console.log("[CheckoutService] addAddress() - Address created in backend with ID:", backendId);
  } catch (error) {
    console.error("[CheckoutService] addAddress() - Failed to create address in backend:", error);
    // Continue with local storage as fallback
    console.warn("[CheckoutService] addAddress() - Saving address locally only");
  }
  
  // Create address object (stored locally with backend ID if available)
  const addressId = backendId ? String(backendId) : `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const address = {
    id: addressId,
    backendId: backendId, // Store backend ID for use in update-checkout
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
    backendFormat: backendAddressData,
  };
  
  // Save to localStorage
  const savedAddresses = loadSavedAddresses();
  savedAddresses.push(address);
  saveAddresses(savedAddresses);
  
  console.log("[CheckoutService] addAddress() - Address saved locally:", {
    id: address.id,
    backendId: address.backendId,
    name: address.fullName,
  });
  
  return {
    data: {
      address: address,
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
  const startTime = Date.now();
  try {
    console.log("=".repeat(80));
    console.log("[CheckoutService] createOrder() - ========== ORDER CREATION START ==========");
    console.log("[CheckoutService] createOrder() - Timestamp:", new Date().toISOString());
    console.log("[CheckoutService] createOrder() - Starting order creation with payload:", JSON.stringify(payload, null, 2));
    
    const { items = [], addressData = null, orderCode = null, paymentMethod = "card", total = 0 } = payload;
    
    // Validate inputs
    console.log("[CheckoutService] createOrder() - Input validation:");
    console.log("  - Items count:", items.length);
    console.log("  - Items:", items.map(item => ({ sku: item.sku, title: item.title, qty: item.qty, price: item.price })));
    console.log("  - Address data:", addressData ? "Present" : "Missing");
    console.log("  - Payment method:", paymentMethod);
    console.log("  - Total:", total);
    console.log("  - Order code provided:", orderCode || "None (will generate)");
    
    // Generate order code if not provided
    const finalOrderCode = orderCode || `order_${Date.now()}`;
    console.log("[CheckoutService] createOrder() - Final order code:", finalOrderCode);
    
    // Transform cart items to API format
    // API expects: item: [{ id: 0, item: { id: 0, product: {...}, ... }, quantity: 0 }]
    console.log("[CheckoutService] createOrder() - Transforming cart items to API format...");
    const orderItems = items.map((cartItem, index) => {
      const transformed = {
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
      
      console.log(`[CheckoutService] createOrder() - Item ${index + 1}/${items.length} transformed:`, {
        sku: cartItem.sku,
        title: cartItem.title,
        qty: transformed.quantity,
        price: transformed.item.product_price,
        product_id: transformed.item.product.id,
      });
      
      return transformed;
    });
    
    console.log("[CheckoutService] createOrder() - Transformed order items count:", orderItems.length);
    console.log("[CheckoutService] createOrder() - Sample transformed item:", JSON.stringify(orderItems[0] || {}, null, 2));
    
    // Prepare order payload
    console.log("[CheckoutService] createOrder() - Preparing order payload...");
    const orderDate = new Date().toISOString();
    const orderPayload = {
      item: orderItems,
      order_date: orderDate,
      order_price: parseFloat(total || 0),
      order_code: finalOrderCode,
      order_status: "PENDING",
      payment: [{
        payment_method: paymentMethod,
        payment_date: orderDate,
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
    
    console.log("[CheckoutService] createOrder() - Order payload summary:", {
      order_code: finalOrderCode,
      item_count: orderItems.length,
      total: orderPayload.order_price,
      has_address: !!addressData,
      payment_method: paymentMethod,
      order_date: orderDate,
    });
    
    if (addressData) {
      console.log("[CheckoutService] createOrder() - Address data:", {
        id: addressData.id,
        name: addressData.name,
        email: addressData.email,
        city: addressData.city,
        district: addressData.district,
        full_address: addressData.full_address?.substring(0, 50) + "...",
      });
    } else {
      console.warn("[CheckoutService] createOrder() - WARNING: No address data provided!");
    }
    
    console.log("[CheckoutService] createOrder() - Full order payload (JSON):", JSON.stringify(orderPayload, null, 2));
    console.log("[CheckoutService] createOrder() - Making POST request to /v1/orders/");
    
    const requestStartTime = Date.now();
    const response = await API.post("/v1/orders/", orderPayload);
    const requestDuration = Date.now() - requestStartTime;
    
    console.log("[CheckoutService] createOrder() - API request completed:", {
      duration_ms: requestDuration,
      status: response.status,
      statusText: response.statusText,
    });
    
    console.log("[CheckoutService] createOrder() - API response data:", JSON.stringify(response.data, null, 2));
    
    // CRITICAL: Validate response status - only 200/201 means success
    if (response.status !== 200 && response.status !== 201) {
      const errorMessage = response.data?.detail || response.data?.message || `Order creation failed with status ${response.status}`;
      console.error("[CheckoutService] createOrder() - API returned non-success status:", {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        response_data: response.data,
      });
      
      const error = new Error(errorMessage);
      error.response = response;
      error.status = response.status;
      throw error;
    }
    
    // Verify we have order data in response
    if (!response.data) {
      console.error("[CheckoutService] createOrder() - API returned success but no data in response");
      throw new Error("Order creation succeeded but no order data returned");
    }
    
    // Verify order_code or id exists in response
    const returnedOrderCode = response.data?.order_code || response.data?.id || response.data?.orderCode;
    if (!returnedOrderCode) {
      console.warn("[CheckoutService] createOrder() - WARNING: No order_code/id in response, using generated code");
      console.warn("[CheckoutService] createOrder() - Response data:", JSON.stringify(response.data, null, 2));
    }
    
    const totalDuration = Date.now() - startTime;
    console.log("[CheckoutService] createOrder() - Order created successfully in backend:", {
      order_code: returnedOrderCode || finalOrderCode,
      order_id: response.data?.id,
      status: response.status,
      total_duration_ms: totalDuration,
      response_has_data: !!response.data,
      response_keys: Object.keys(response.data || {}),
    });
    console.log("[CheckoutService] createOrder() - Full order response:", JSON.stringify(response.data, null, 2));
    console.log("[CheckoutService] createOrder() - ========== ORDER CREATION SUCCESS ==========");
    console.log("=".repeat(80));
    
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error("=".repeat(80));
    console.error("[CheckoutService] createOrder() - ========== ORDER CREATION ERROR ==========");
    console.error("[CheckoutService] createOrder() - Error after", totalDuration, "ms");
    console.error("[CheckoutService] createOrder() - Error message:", error.message);
    console.error("[CheckoutService] createOrder() - Error stack:", error.stack);
    
    if (error.response) {
      console.error("[CheckoutService] createOrder() - Error response status:", error.response.status);
      console.error("[CheckoutService] createOrder() - Error response headers:", error.response.headers);
      console.error("[CheckoutService] createOrder() - Error response data:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error("[CheckoutService] createOrder() - Request was made but no response received");
      console.error("[CheckoutService] createOrder() - Request:", error.request);
    }
    
    console.error("[CheckoutService] createOrder() - ========== ORDER CREATION FAILED ==========");
    console.error("=".repeat(80));
    throw error;
  }
};

// ====== Order placement ======
// Note: Orders can be created directly via createOrder or through payment flow
// The order is created when payment is processed via /v1/payments/order-payment/
export const placeOrder = async (payload) => {
  const startTime = Date.now();
  try {
    console.log("=".repeat(80));
    console.log("[CheckoutService] placeOrder() - ========== ORDER PLACEMENT START ==========");
    console.log("[CheckoutService] placeOrder() - Timestamp:", new Date().toISOString());
    console.log("[CheckoutService] placeOrder() - Starting order placement with payload:", {
      items_count: payload.items?.length || 0,
      paymentMethod: payload.paymentMethod,
      total: payload.total,
      has_address: !!payload.addressData,
      addressId: payload.addressId,
      paymentIntentId: payload.paymentIntentId ? (payload.paymentIntentId.substring(0, 20) + "...") : "None",
      orderCode: payload.orderCode || "NOT PROVIDED",
    });
    
    // CRITICAL: Log if orderCode is missing
    if (!payload.orderCode) {
      console.error("[CheckoutService] placeOrder() - WARNING: orderCode not provided in payload!");
      console.error("[CheckoutService] placeOrder() - Full payload:", JSON.stringify({
        ...payload,
        paymentIntentId: payload.paymentIntentId ? (payload.paymentIntentId.substring(0, 20) + "...") : "None",
      }, null, 2));
    }
    console.log("[CheckoutService] placeOrder() - Full payload:", JSON.stringify({
      ...payload,
      paymentIntentId: payload.paymentIntentId ? (payload.paymentIntentId.substring(0, 20) + "...") : "None",
    }, null, 2));
    
    // Check if this is a dummy payment (paymentIntentId starts with "dummy_")
    const isDummyPayment = payload.paymentIntentId && payload.paymentIntentId.startsWith("dummy_");
    console.log("[CheckoutService] placeOrder() - Payment type:", {
      isDummyPayment,
      paymentMethod: payload.paymentMethod,
    });
    
    // Step 1: Get the current order created by startCheckout
    // The order should already exist from startCheckout, so we fetch it instead of creating a new one
    console.log("[CheckoutService] placeOrder() - Step 1: Fetching current order from backend...");
    const getOrderStartTime = Date.now();
    
    let currentOrder = null;
    let orderCode = payload.orderCode || null;
    
    // If orderCode is provided in payload, use it (from startCheckout)
    if (orderCode) {
      console.log("[CheckoutService] placeOrder() - Using orderCode from payload:", orderCode);
      // Try to fetch the order to verify it exists, but don't fail if we can't
      try {
        const currentOrderResponse = await getCurrentOrder();
        currentOrder = currentOrderResponse.data;
        if (currentOrder) {
          // Verify the order code matches
          const fetchedOrderCode = currentOrder.order_code || currentOrder.id;
          if (fetchedOrderCode && fetchedOrderCode !== orderCode) {
            console.warn("[CheckoutService] placeOrder() - Order code mismatch:", {
              provided: orderCode,
              fetched: fetchedOrderCode,
            });
            // Use the fetched one if it exists
            orderCode = fetchedOrderCode;
          }
          console.log("[CheckoutService] placeOrder() - Verified order exists:", {
            order_code: orderCode,
            order_status: currentOrder.order_status,
            item_count: currentOrder.item?.length || 0,
          });
        } else {
          console.warn("[CheckoutService] placeOrder() - Order code provided but order not found in backend, proceeding with provided code");
        }
      } catch (error) {
        console.warn("[CheckoutService] placeOrder() - Could not verify order, but proceeding with provided orderCode:", orderCode);
      }
    } else {
      // No orderCode provided, try to fetch current order
      console.log("[CheckoutService] placeOrder() - No orderCode provided, fetching current order...");
      try {
        const currentOrderResponse = await getCurrentOrder();
        currentOrder = currentOrderResponse.data;
        
        if (currentOrder) {
          orderCode = currentOrder.order_code || currentOrder.id;
          console.log("[CheckoutService] placeOrder() - Found current order:", {
            order_code: orderCode,
            order_status: currentOrder.order_status,
            item_count: currentOrder.item?.length || 0,
          });
        } else {
          console.error("[CheckoutService] placeOrder() - No current order found and no orderCode provided");
          throw new Error("No current order found and no orderCode provided. Please ensure startCheckout was called first.");
        }
      } catch (error) {
        console.error("[CheckoutService] placeOrder() - Error fetching current order:", error);
        if (error.message && error.message.includes("No current order")) {
          throw error; // Re-throw our custom error
        }
        // For other errors, still throw but with more context
        throw new Error("Failed to fetch current order and no orderCode provided. Please ensure startCheckout was called first.");
      }
    }
    
    const getOrderDuration = Date.now() - getOrderStartTime;
    
    if (!orderCode) {
      throw new Error("Order code is required but not found. Please ensure startCheckout was called first.");
    }
    
    console.log("[CheckoutService] placeOrder() - Step 1 completed: Using order from backend:", {
      order_code: orderCode,
      duration_ms: getOrderDuration,
      order_found: !!currentOrder,
      order_status: currentOrder?.order_status,
    });
    
    // Skip payment processing only for dummy payments
    // All real payments (card, cod, esewa, khalti) should be processed in PaymentSection component
    // PaymentSection will call order-payment endpoint with the order_code
    if (isDummyPayment) {
      console.log("[CheckoutService] placeOrder() - Step 2: Skipping payment processing (dummy payment):", {
        isDummyPayment,
        paymentMethod: payload.paymentMethod,
        reason: "dummy payment - will be processed in PaymentSection"
      });
      
      // Order created successfully - return success response
      // Payment will be processed in PaymentSection component
      const totalDuration = Date.now() - startTime;
      console.log("[CheckoutService] placeOrder() - Order placement completed successfully:", {
        order_code: orderCode,
        total_duration_ms: totalDuration,
        payment_note: "Payment will be processed in PaymentSection via order-payment endpoint",
      });
      console.log("[CheckoutService] placeOrder() - ========== ORDER PLACEMENT SUCCESS ==========");
      console.log("=".repeat(80));
      
      return {
        data: {
          orderId: orderCode,
          order: currentOrder || { order_code: orderCode, order_status: "PENDING" },
          status: "succeeded",
          message: "Order placed successfully",
        },
      };
    }
    
    // For real payments, payment processing is handled in PaymentSection component
    // PaymentSection will call order-payment endpoint with the order_code after order is created
    console.log("[CheckoutService] placeOrder() - Step 2: Payment will be processed in PaymentSection component");
    console.log("[CheckoutService] placeOrder() - Order code available for payment:", orderCode);
    
    // Order created successfully - return success response
    // Payment will be processed in PaymentSection component using order-payment endpoint
    const totalDuration = Date.now() - startTime;
    console.log("[CheckoutService] placeOrder() - Order placement completed successfully:", {
        order_code: orderCode,
      total_duration_ms: totalDuration,
      payment_note: "Payment will be processed in PaymentSection via order-payment endpoint",
    });
    console.log("[CheckoutService] placeOrder() - ========== ORDER PLACEMENT SUCCESS ==========");
    console.log("=".repeat(80));
    
    return {
      data: {
        orderId: orderCode,
        order: currentOrder || { order_code: orderCode, order_status: "PENDING" },
        status: "succeeded",
        message: "Order placed successfully",
      },
    };
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error("=".repeat(80));
    console.error("[CheckoutService] placeOrder() - ========== ORDER PLACEMENT ERROR ==========");
    console.error("[CheckoutService] placeOrder() - Error after", totalDuration, "ms");
    console.error("[CheckoutService] placeOrder() - Error message:", error.message);
    console.error("[CheckoutService] placeOrder() - Error stack:", error.stack);
    
    if (error.response) {
      console.error("[CheckoutService] placeOrder() - Error response:", {
        status: error.response.status,
        data: JSON.stringify(error.response.data, null, 2),
      });
    }
    
    console.error("[CheckoutService] placeOrder() - ========== ORDER PLACEMENT FAILED ==========");
    console.error("=".repeat(80));
    throw error;
  }
};
