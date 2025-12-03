import API from "../../axios";

/**
 * Process order payment
 * @param {Object} payload - Order payment details
 * @param {string} payload.payment_method - Payment method (e.g., "stripe", "esewa", "khalti", "cod")
 * @param {string} payload.amount - Amount as string (can be negative)
 * @param {string} payload.order_code - Order code
 * @param {string} [payload.ref_code] - Reference code
 * @param {string} [payload.pidx] - Payment ID
 * @param {Object} [payload.card_details] - Card details for card payments
 * @param {string} [payload.card_details.number] - Card number (last 4 digits or full for dummy)
 * @param {string} [payload.card_details.holder] - Card holder name
 * @param {string} [payload.card_details.expMonth] - Expiry month
 * @param {string} [payload.card_details.expYear] - Expiry year
 * @param {string} [payload.card_details.cvv] - CVV (for dummy payments only, never send real CVV)
 * @returns {Promise<Object>} Payment response
 */
export const processOrderPayment = async (payload) => {
  try {
    console.log("[PaymentService] processOrderPayment() - Processing payment:", {
      ...payload,
      card_details: payload.card_details ? {
        ...payload.card_details,
        number: payload.card_details.number ? (payload.card_details.number.length > 4 ? `****${payload.card_details.number.slice(-4)}` : payload.card_details.number) : undefined,
        cvv: payload.card_details.cvv ? "***" : undefined,
      } : undefined,
    });
    
    // Validate required fields
    if (!payload.payment_method) {
      throw new Error("payment_method is required (esewa, khalti, cod, or card)");
    }
    if (payload.amount === undefined || payload.amount === null) {
      throw new Error("amount is required");
    }
    if (!payload.order_code) {
      throw new Error("order_code is required");
    }
    
    // Validate payment method
    // Note: API accepts "esewa", "khalti", "cod" - but we'll also allow "card" for card payments
    const validMethods = ["esewa", "khalti", "cod", "card"];
    const normalizedMethod = payload.payment_method.toLowerCase();
    if (!validMethods.includes(normalizedMethod)) {
      throw new Error(`Invalid payment_method. Must be one of: ${validMethods.join(", ")}`);
    }
    
    // For card payments, map to a backend-compatible method if needed
    // If backend doesn't accept "card", we might need to use "cod" or another method
    // For now, we'll send "card" and let the backend handle it
    const backendPaymentMethod = normalizedMethod === "card" ? "card" : normalizedMethod;
    
    // Format amount to 2 decimal places (API requirement)
    const amountValue = parseFloat(payload.amount) || 0;
    const formattedAmount = amountValue.toFixed(2);
    
    // Build request body according to API schema
    // All fields must be strings according to schema
    const requestBody = {
      payment_method: String(backendPaymentMethod),
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
    
    // Include card details for card payments (store in backend)
    if (payload.payment_method === "card" && payload.card_details) {
      const card = payload.card_details;
      const isDummy = payload.ref_code && payload.ref_code.includes("dummy");
      
      // Store card information (mask sensitive data for real payments)
      if (card.number) {
        // For real payments, only send last 4 digits. For dummy, send full number if needed
        requestBody.card_number = isDummy ? String(card.number) : String(card.number.slice(-4));
      }
      
      if (card.holder) {
        requestBody.card_holder = String(card.holder);
      }
      
      if (card.expMonth) {
        requestBody.card_exp_month = String(card.expMonth);
      }
      
      if (card.expYear) {
        requestBody.card_exp_year = String(card.expYear);
      }
      
      // Only send CVV for dummy payments (NEVER for real payments - security risk)
      if (isDummy && card.cvv) {
        requestBody.card_cvv = String(card.cvv);
      }
      
      // Determine card brand
      if (card.number) {
        const firstDigit = card.number.charAt(0);
        if (firstDigit === "4") {
          requestBody.card_brand = "Visa";
        } else if (firstDigit === "5") {
          requestBody.card_brand = "Mastercard";
        } else if (firstDigit === "3") {
          requestBody.card_brand = "Amex";
        }
      }
    }
    
    console.log("[PaymentService] processOrderPayment() - Request body:", {
      ...requestBody,
      card_cvv: requestBody.card_cvv ? "***" : undefined, // Don't log CVV
    });
    
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

