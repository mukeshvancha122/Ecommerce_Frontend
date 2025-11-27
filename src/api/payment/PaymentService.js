import API from "../../axios";

/**
 * Process Stripe payment
 * @param {Object} payload - Payment details
 * @param {string} payload.card_number - Card number
 * @param {string} payload.expiry_month - Expiry month (e.g., "01")
 * @param {string} payload.expiry_year - Expiry year (e.g., "2028")
 * @param {string} payload.cvc - CVC code
 * @returns {Promise<Object>} Payment response
 */
export const processStripePayment = async (payload) => {
  try {
    const response = await API.post("/v1/payments/stripe-payment/", payload);
    return response.data;
  } catch (error) {
    console.error("Error processing Stripe payment:", error);
    throw error;
  }
};

/**
 * Process order payment
 * @param {Object} payload - Order payment details
 * @param {string} payload.payment_method - Payment method (e.g., "esewa", "khalti", "cod")
 * @param {string} payload.amount - Amount as string
 * @param {string} payload.order_code - Order code
 * @param {string} [payload.ref_code] - Reference code
 * @param {string} [payload.pidx] - Payment ID
 * @returns {Promise<Object>} Payment response
 */
export const processOrderPayment = async (payload) => {
  try {
    const response = await API.post("/v1/payments/order-payment/", payload);
    return response.data;
  } catch (error) {
    console.error("Error processing order payment:", error);
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
    const response = await API.post("/v1/orders/update-checkout/", payload);
    return response.data;
  } catch (error) {
    console.error("Error updating checkout:", error);
    // Handle authentication error
    if (error.response?.status === 401) {
      throw new Error("Authentication required. Please log in to continue.");
    }
    throw error;
  }
};

