import API from "../../axios";

/**
 * Process Stripe payment
 * @param {Object} payload - Payment details
 * @param {string} payload.card_number - Card number (e.g., "112233445566")
 * @param {string} payload.expiry_month - Expiry month (e.g., "01/28" or "01")
 * @param {string} payload.expiry_year - Expiry year (e.g., "2028")
 * @param {string} payload.cvc - CVC code
 * @returns {Promise<Object>} Payment response
 */
export const processStripePayment = async (payload) => {
  try {
    // Format expiry_month if it's in "MM/YY" format, extract month
    let expiryMonth = payload.expiry_month;
    if (expiryMonth && expiryMonth.includes("/")) {
      expiryMonth = expiryMonth.split("/")[0];
    }
    
    const requestBody = {
      card_number: payload.card_number || "",
      expiry_month: expiryMonth || "",
      expiry_year: payload.expiry_year || "",
      cvc: payload.cvc || "",
    };
    
    const response = await API.post("/v1/payments/stripe-payment/", requestBody);
    return response.data;
  } catch (error) {
    console.error("Error processing Stripe payment:", error);
    throw error;
  }
};

/**
 * Process order payment
 * @param {Object} payload - Order payment details
 * @param {string} payload.payment_method - Payment method (e.g., "stripe", "esewa", "khalti", "cod")
 * @param {string} payload.amount - Amount as string (can be negative)
 * @param {string} payload.order_code - Order code
 * @param {string} [payload.ref_code] - Reference code
 * @param {string} [payload.pidx] - Payment ID
 * @returns {Promise<Object>} Payment response
 */
export const processOrderPayment = async (payload) => {
  try {
    console.log("[PaymentService] processOrderPayment() - Processing payment:", payload);
    
    // Validate required fields
    if (!payload.payment_method) {
      throw new Error("payment_method is required (esewa, khalti, or cod)");
    }
    if (payload.amount === undefined || payload.amount === null) {
      throw new Error("amount is required");
    }
    if (!payload.order_code) {
      throw new Error("order_code is required");
    }
    
    // Validate payment method
    const validMethods = ["esewa", "khalti", "cod"];
    if (!validMethods.includes(payload.payment_method.toLowerCase())) {
      throw new Error(`Invalid payment_method. Must be one of: ${validMethods.join(", ")}`);
    }
    
    // Format amount to 2 decimal places (API requirement)
    const amountValue = parseFloat(payload.amount) || 0;
    const formattedAmount = amountValue.toFixed(2);
    
    // Build request body according to API schema
    // All fields must be strings according to schema
    const requestBody = {
      payment_method: String(payload.payment_method),
      amount: formattedAmount, // Must have max 2 decimal places
      order_code: String(payload.order_code),
    };
    
    // Only include optional fields if they have actual values (not empty strings)
    // API validation requires these fields to not be blank if included
    if (payload.ref_code && String(payload.ref_code).trim() !== "") {
      requestBody.ref_code = String(payload.ref_code).trim();
    }
    if (payload.pidx && String(payload.pidx).trim() !== "") {
      requestBody.pidx = String(payload.pidx).trim();
    }
    
    console.log("[PaymentService] processOrderPayment() - Request body:", requestBody);
    
    const response = await API.post("/v1/payments/order-payment/", requestBody);
    
    console.log("[PaymentService] processOrderPayment() - Response:", response.data);
    console.log("[PaymentService] processOrderPayment() - Response status:", response.status);
    return response.data;
  } catch (error) {
    console.error("[PaymentService] processOrderPayment() - ERROR:", error);
    console.error("[PaymentService] processOrderPayment() - Error response:", error.response?.data);
    console.error("[PaymentService] processOrderPayment() - Error status:", error.response?.status);
    throw error;
  }
};

/**
 * Update checkout with shipping and drop location
 * @param {Object} payload - Checkout update details
 * @param {string} payload.drop_location_id - Drop location ID
 * @param {string} payload.shipping - Shipping information
 * @returns {Promise<Object>} Update response
 */
export const updateCheckout = async (payload) => {
  try {
    console.log("[PaymentService] updateCheckout() - Updating checkout with:", payload);
    
    // Clean payload - only send expected fields
    const requestBody = {
      drop_location_id: payload.drop_location_id,
      shipping: payload.shipping,
    };
    
    // Only include additional fields if they're expected by backend
    // Remove 'address' field as it might cause 500 error
    
    console.log("[PaymentService] updateCheckout() - Request body:", requestBody);
    
    const response = await API.post("/v1/orders/update-checkout/", requestBody);
    
    console.log("[PaymentService] updateCheckout() - Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("[PaymentService] updateCheckout() - ERROR:", error);
    console.error("[PaymentService] updateCheckout() - Error response:", error.response?.data);
    // Handle authentication error
    if (error.response?.status === 401) {
      throw new Error("Authentication required. Please log in to continue.");
    }
    throw error;
  }
};

