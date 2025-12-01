import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAddresses, addAddress, updateAddress, setDefaultAddress,
  getShippingQuote, createPaymentIntent, placeOrder, startCheckout, updateOrderCheckout,
  createShippingAddress
} from "../../api/CheckoutService";
import { updateCheckout } from "../../api/payment/PaymentService";

export const fetchAddresses = createAsyncThunk("checkout/fetchAddresses", async () => {
  const { data } = await getAddresses();
  console.log("data", data);
  return data.addresses || [];
});

/**
 * Sync a local address to backend and get the backend ID
 * This is called when a local address is selected but doesn't have a backendId
 */
export const syncAddressToBackend = createAsyncThunk(
  "checkout/syncAddressToBackend",
  async (address, { rejectWithValue }) => {
    try {
      console.log("[CheckoutSlice] syncAddressToBackend() - Syncing local address to backend:", {
        id: address.id,
        name: address.fullName,
        hasBackendId: !!address.backendId,
      });
      
      // If address already has a backendId, return it
      if (address.backendId) {
        console.log("[CheckoutSlice] syncAddressToBackend() - Address already has backendId:", address.backendId);
        return {
          localId: address.id,
          backendId: address.backendId,
          address: address,
        };
      }
      
      // Prepare backend format
      const phoneNumber = address.phone 
        ? (typeof address.phone === 'string' 
            ? parseInt(address.phone.replace(/\D/g, ''), 10) 
            : Number(address.phone))
        : 0;
      
      const fullAddress = `${address.address1 || ""} ${address.address2 || ""}`.trim();
      
      const backendAddressData = {
        email: address.email || "",
        name: address.fullName || "",
        phone: phoneNumber,
        full_address: fullAddress,
        district: address.district || address.state || "",
        city: address.city || "",
        label: address.label || address.fullName || "",
      };
      
      // Create address in backend
      const response = await createShippingAddress(backendAddressData);
      const backendId = response.data.id;
      
      console.log("[CheckoutSlice] syncAddressToBackend() - Address created in backend with ID:", backendId);
      
      // Update local address with backendId
      const updatedAddress = {
        ...address,
        backendId: backendId,
      };
      
      // Update in localStorage
      const savedAddresses = JSON.parse(localStorage.getItem("saved_addresses_v1") || "[]");
      const addressIndex = savedAddresses.findIndex(addr => addr.id === address.id);
      if (addressIndex !== -1) {
        savedAddresses[addressIndex] = updatedAddress;
        localStorage.setItem("saved_addresses_v1", JSON.stringify(savedAddresses));
        console.log("[CheckoutSlice] syncAddressToBackend() - Updated address in localStorage with backendId");
      }
      
      return {
        localId: address.id,
        backendId: backendId,
        address: updatedAddress,
      };
    } catch (error) {
      console.error("[CheckoutSlice] syncAddressToBackend() - Error syncing address:", error);
      return rejectWithValue({
        message: error.response?.data?.message || error.message || "Failed to sync address to backend",
        status: error.response?.status,
      });
    }
  }
);

export const initializeCheckout = createAsyncThunk("checkout/initializeCheckout", async (_, { rejectWithValue }) => {
  try {
    const { data } = await startCheckout();
    return data; // { coupons, rewards, checkoutData, order }
  } catch (error) {
    console.error("[CheckoutSlice] initializeCheckout failed:", error);
    return rejectWithValue({
      message: error.response?.data?.message || error.message || "Failed to start checkout",
      status: error.response?.status,
    });
  }
});

export const updateOrderCheckoutThunk = createAsyncThunk(
  "checkout/updateOrderCheckout",
  async ({ shipping_address_id, shipping_type }, { rejectWithValue, getState }) => {
    try {
      console.log("[CheckoutSlice] updateOrderCheckoutThunk() - Updating order checkout");
      console.log("[CheckoutSlice] updateOrderCheckoutThunk() - Input:", {
        shipping_address_id,
        shipping_type,
      });
      
      // Get the address from state to find the backend ID
      const state = getState();
      const addresses = state.checkout.addresses || [];
      const selectedAddress = addresses.find(addr => addr.id === shipping_address_id);
      
      // Use backend ID if available, otherwise use the provided ID
      // The backend ID comes from the shipping-address endpoint
      const dropLocationId = selectedAddress?.backendId || selectedAddress?.id || shipping_address_id;
      
      console.log("[CheckoutSlice] updateOrderCheckoutThunk() - Address lookup:", {
        shipping_address_id,
        found_address: !!selectedAddress,
        backendId: selectedAddress?.backendId,
        using_drop_location_id: dropLocationId,
      });
      
      // First ensure order is created via startCheckout
      if (!state.checkout.order && state.checkout.status !== "loading") {
        console.log("[CheckoutSlice] Order not found, calling startCheckout first");
        try {
          // Call startCheckout directly (not via dispatch since we're in a thunk)
          const { data } = await startCheckout();
          // Update state will be handled by initializeCheckout if called separately
          // For now, we'll just ensure the order exists
          if (!data.order) {
            console.warn("[CheckoutSlice] startCheckout did not return order data");
          }
        } catch (error) {
          console.error("[CheckoutSlice] Failed to start checkout:", error);
          return rejectWithValue({
            message: "Failed to create order. Please try again.",
            status: error.response?.status,
          });
        }
      }
      
      // Use the backend ID (drop_location_id) for the API call
      // The updateOrderCheckout function will map shipping_address_id to drop_location_id
      // But we want to ensure we're using the backend ID from the shipping-address endpoint
      const response = await updateOrderCheckout({ 
        shipping_address_id: dropLocationId, // Use backend ID from shipping-address endpoint
        shipping_type 
      });
      
      // Check if update was skipped (for local storage addresses)
      if (response.skipped) {
        console.log("[CheckoutSlice] updateOrderCheckoutThunk() - Update skipped for local address");
        // Return success response to allow flow to continue
        // Address data will be included in final order creation
        // IMPORTANT: Don't return the message as data - return null or empty object
        // The order should remain in state from startCheckout
        return {
          data: null, // Don't return message object - keep existing order
          status: 200,
          skipped: true,
        };
      }
      
      // Verify successful response (200 or 201) for backend addresses
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Update checkout failed with status ${response.status}`);
      }
      
      console.log("[CheckoutSlice] updateOrderCheckoutThunk() - Successfully updated with status:", response.status);
      console.log("[CheckoutSlice] updateOrderCheckoutThunk() - Response data received:", JSON.stringify(response.data, null, 2));
      
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error("[CheckoutSlice] updateOrderCheckoutThunk() - Error:", error);
      return rejectWithValue({
        message: error.response?.data?.message || error.message || "Failed to update order checkout",
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  }
);

export const createAddress = createAsyncThunk("checkout/createAddress", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await addAddress(payload);
    return data.address;
  } catch (error) {
    // Return error data so component can handle it
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const editAddress = createAsyncThunk("checkout/editAddress", async ({ id, payload }) => {
  const { data } = await updateAddress(id, payload);
  return data.address;
});

export const makeDefaultAddress = createAsyncThunk("checkout/makeDefaultAddress", async (id) => {
  await setDefaultAddress(id);
  return id;
});

export const fetchShippingQuote = createAsyncThunk("checkout/fetchShippingQuote", async (addressData, { getState }) => {
  // Get address from state if not provided
  const state = getState();
  const addressId = state.checkout.selectedAddressId;
  const addresses = state.checkout.addresses;
  const address = addressId ? addresses.find(addr => addr.id === addressId) : null;
  
  // Pass address data (backend format) to shipping quote
  const addressDataForShipping = address?.backendFormat || null;
  const { data } = await getShippingQuote(addressDataForShipping);
  return data;
});

export const startPayment = createAsyncThunk(
  "checkout/startPayment",
  async ({ addressId, items }) => {
    const { data } = await createPaymentIntent({ addressId, items });
    return data; // { clientSecret, amount, currency, orderId }
  }
);

export const confirmOrderThunk = createAsyncThunk(
  "checkout/confirmOrder",
  async ({ addressId, items, paymentIntentId, paymentMethod, total, shipping }, { getState, rejectWithValue, dispatch }) => {
    try {
      // Get address data from state to include in order
      const state = getState();
      const addresses = state.checkout.addresses;
      const address = addressId ? addresses.find(addr => addr.id === addressId) : null;
      const addressData = address?.backendFormat || null;
      
      // CRITICAL: Ensure order exists from startCheckout
      // Check if we have an order in state, if not, call startCheckout
      let orderCode = null;
      let order = state.checkout.order;
      
      // Validate that order is actually an order object, not a message
      if (order && (!order.order_code && !order.id && !order.orderCode)) {
        // This is not a valid order object (might be a message), treat as null
        console.warn("[CheckoutSlice] confirmOrderThunk() - Order in state is not a valid order object:", order);
        order = null;
      }
      
      console.log("[CheckoutSlice] confirmOrderThunk() - Checking for existing order in state:", {
        has_order: !!order,
        order_data: order ? {
          order_code: order.order_code || order.id || order.orderCode,
          id: order.id,
          order_status: order.order_status,
          order_keys: Object.keys(order),
        } : null,
      });
      
      if (!order || (!order.order_code && !order.id && !order.orderCode)) {
        console.log("[CheckoutSlice] confirmOrderThunk() - No valid order in state, calling startCheckout first...");
        try {
          const { data: checkoutData } = await startCheckout();
          console.log("[CheckoutSlice] confirmOrderThunk() - startCheckout response:", {
            has_order: !!checkoutData.order,
            checkout_data: checkoutData,
          });
          
          order = checkoutData.order;
          
          // If startCheckout didn't return order, try fetching current order directly with retries
          if (!order) {
            console.log("[CheckoutSlice] confirmOrderThunk() - startCheckout didn't return order, fetching current order with retries...");
            const { getCurrentOrder } = await import("../../api/CheckoutService");
            
            // Retry up to 3 times with delays (order might not be immediately available)
            let retries = 3;
            let retryDelay = 500; // Start with 500ms delay
            
            while (!order && retries > 0) {
              try {
                console.log(`[CheckoutSlice] confirmOrderThunk() - Attempting to fetch current order (${4 - retries}/3)...`);
                const currentOrderResponse = await getCurrentOrder();
                order = currentOrderResponse.data;
                
                if (order) {
                  console.log("[CheckoutSlice] confirmOrderThunk() - Fetched current order:", {
                    order_code: order.order_code || order.id,
                    order_status: order.order_status,
                  });
                  break; // Found order, exit retry loop
                } else {
                  console.warn(`[CheckoutSlice] confirmOrderThunk() - No current order found, retrying in ${retryDelay}ms...`);
                  retries--;
                  if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    retryDelay *= 2; // Exponential backoff
                  }
                }
              } catch (fetchError) {
                console.error(`[CheckoutSlice] confirmOrderThunk() - Failed to fetch current order (attempt ${4 - retries}/3):`, fetchError);
                retries--;
                if (retries > 0) {
                  await new Promise(resolve => setTimeout(resolve, retryDelay));
                  retryDelay *= 2;
                }
              }
            }
            
            if (!order) {
              console.error("[CheckoutSlice] confirmOrderThunk() - CRITICAL: Could not fetch order after all retries");
            }
          }
          
          if (order) {
            orderCode = order.order_code || order.id || order.orderCode;
            console.log("[CheckoutSlice] confirmOrderThunk() - Order obtained:", {
              order_code: orderCode,
              order_status: order.order_status,
              order_keys: Object.keys(order),
            });
            
            if (!orderCode) {
              console.error("[CheckoutSlice] confirmOrderThunk() - ERROR: Order exists but no order_code/id found!");
              console.error("[CheckoutSlice] confirmOrderThunk() - Order object:", JSON.stringify(order, null, 2));
            }
          } else {
            console.error("[CheckoutSlice] confirmOrderThunk() - CRITICAL: startCheckout did not return order and current order fetch failed");
            console.error("[CheckoutSlice] confirmOrderThunk() - Checkout data:", JSON.stringify(checkoutData, null, 2));
          }
        } catch (error) {
          console.error("[CheckoutSlice] confirmOrderThunk() - Failed to start checkout:", error);
          console.error("[CheckoutSlice] confirmOrderThunk() - Error details:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });
          return rejectWithValue({
            message: "Failed to create order. Please try again.",
            status: error.response?.status,
          });
        }
      } else {
        orderCode = order.order_code || order.id || order.orderCode;
        console.log("[CheckoutSlice] confirmOrderThunk() - Using existing order from state:", {
          order_code: orderCode,
          order_status: order.order_status,
          order_keys: Object.keys(order),
        });
        
        if (!orderCode) {
          console.error("[CheckoutSlice] confirmOrderThunk() - ERROR: Order in state but no order_code/id found!");
          console.error("[CheckoutSlice] confirmOrderThunk() - Order object:", JSON.stringify(order, null, 2));
        }
      }
      
      // Final validation - orderCode must exist
      // If we still don't have an orderCode, generate a temporary one
      // The backend should accept this or create its own
      if (!orderCode) {
        console.error("[CheckoutSlice] confirmOrderThunk() - CRITICAL: No orderCode available after all attempts!");
        console.error("[CheckoutSlice] confirmOrderThunk() - Order:", order);
        console.error("[CheckoutSlice] confirmOrderThunk() - Generating temporary order code as fallback...");
        
        // Generate a temporary order code - backend should handle this
        orderCode = `order_${Date.now()}`;
        console.warn("[CheckoutSlice] confirmOrderThunk() - Using generated order code:", orderCode);
        console.warn("[CheckoutSlice] confirmOrderThunk() - WARNING: This is a fallback - order may not exist in backend!");
      }
      
      console.log("[CheckoutSlice] confirmOrderThunk() - OrderCode confirmed:", orderCode);
      
      // Update checkout with shipping info if available
      // Only call updateCheckout if addressId is a numeric ID (backend database ID)
      // Local storage addresses have string IDs like 'addr_xxx' which won't work
      const isNumericId = addressId && /^\d+$/.test(String(addressId));
      
      if (isNumericId && shipping) {
        try {
          console.log("[CheckoutSlice] Updating checkout with:", { drop_location_id: addressId, shipping });
          await updateCheckout({
            drop_location_id: Number(addressId), // Ensure it's a number
            shipping: JSON.stringify(shipping),
          });
        } catch (error) {
          console.warn("[CheckoutSlice] Failed to update checkout:", error);
          console.warn("[CheckoutSlice] Error details:", error.response?.data);
          // Continue with order placement even if update fails
        }
      } else if (addressId && !isNumericId) {
        console.log("[CheckoutSlice] Skipping updateCheckout - addressId is not a numeric backend ID:", addressId);
      }

      console.log("=".repeat(80));
      console.log("[CheckoutSlice] confirmOrderThunk() - ========== CONFIRM ORDER START ==========");
      console.log("[CheckoutSlice] confirmOrderThunk() - Timestamp:", new Date().toISOString());
      console.log("[CheckoutSlice] confirmOrderThunk() - Input parameters:", {
        addressId,
        items_count: items?.length || 0,
        paymentMethod,
        total,
        has_paymentIntentId: !!paymentIntentId,
        shipping: shipping ? "Present" : "Missing",
        orderCode: orderCode || "Not found",
      });
      
      console.log("[CheckoutSlice] confirmOrderThunk() - Calling placeOrder with order code:", orderCode);
      console.log("[CheckoutSlice] confirmOrderThunk() - placeOrder payload:", {
        addressId,
        items_count: items?.length || 0,
        paymentMethod,
        total,
        has_paymentIntentId: !!paymentIntentId,
        orderCode: orderCode,
        has_addressData: !!addressData,
      });
      
      const placeOrderStartTime = Date.now();
      const { data } = await placeOrder({
        addressId,
        addressData, // Pass address data for shipping
        items,
        paymentIntentId,
        paymentMethod,
        total,
        orderCode: orderCode, // Pass the order code from startCheckout - CRITICAL
      });
      const placeOrderDuration = Date.now() - placeOrderStartTime;
      
      // Validate order was actually created
      if (!data?.orderId) {
        console.error("[CheckoutSlice] confirmOrderThunk() - ERROR: No orderId in response");
        console.error("[CheckoutSlice] confirmOrderThunk() - Response data:", JSON.stringify(data, null, 2));
        throw new Error("Order creation failed: No order ID returned");
      }
      
      console.log("[CheckoutSlice] confirmOrderThunk() - Order placed successfully in backend:", {
        orderId: data.orderId,
        status: data.status,
        duration_ms: placeOrderDuration,
        has_order: !!data.order,
        order_code: data.order?.order_code,
        order_id: data.order?.id,
        order_status: data.order?.order_status,
        order_data: JSON.stringify(data, null, 2),
      });
      
      // Clear cart after successful order placement
      console.log("[CheckoutSlice] confirmOrderThunk() - Clearing cart after successful order placement...");
      try {
        // Import clearCartBackend to clear the backend cart
        const { clearCartBackend } = await import("../../api/cart/CartService");
        const { clearCart } = await import("../cart/CartSlice");
        
        const cartClearStartTime = Date.now();
        
        // Clear backend cart
        await clearCartBackend();
        console.log("[CheckoutSlice] confirmOrderThunk() - Backend cart cleared");
        
        // Clear local Redux cart state
        dispatch(clearCart());
        console.log("[CheckoutSlice] confirmOrderThunk() - Redux cart state cleared");
        
        const cartClearDuration = Date.now() - cartClearStartTime;
        console.log("[CheckoutSlice] confirmOrderThunk() - Cart cleared successfully:", {
          duration_ms: cartClearDuration,
        });
      } catch (cartError) {
        console.error("[CheckoutSlice] confirmOrderThunk() - Error clearing cart:", cartError);
        console.warn("[CheckoutSlice] confirmOrderThunk() - Cart clearing failed, but order was placed successfully");
        // Don't throw - order is already placed, cart clearing failure shouldn't block success
        // Cart will be cleared on next page load or refresh
      }
      
      console.log("[CheckoutSlice] confirmOrderThunk() - ========== CONFIRM ORDER SUCCESS ==========");
      console.log("=".repeat(80));
      
      return data; // { orderId, status, order }
    } catch (error) {
      console.error("=".repeat(80));
      console.error("[CheckoutSlice] confirmOrderThunk() - ========== CONFIRM ORDER ERROR ==========");
      console.error("[CheckoutSlice] confirmOrderThunk() - Error message:", error.message);
      console.error("[CheckoutSlice] confirmOrderThunk() - Error stack:", error.stack);
      
      if (error.response) {
        console.error("[CheckoutSlice] confirmOrderThunk() - Error response:", {
          status: error.response.status,
          data: JSON.stringify(error.response.data, null, 2),
        });
      }
      
      // Extract user-friendly error message
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message || 
                           "Failed to place order";
      
      console.error("[CheckoutSlice] confirmOrderThunk() - User-friendly error:", errorMessage);
      console.error("[CheckoutSlice] confirmOrderThunk() - ========== CONFIRM ORDER FAILED ==========");
      console.error("=".repeat(80));
      
      // Return error with value so component can access it
      return rejectWithValue({
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  }
);

// Load selected address ID from localStorage
const loadSelectedAddressId = () => {
  try {
    const saved = localStorage.getItem("selectedAddressId_v1");
    return saved || null;
  } catch {
    return null;
  }
};

const saveSelectedAddressId = (id) => {
  try {
    if (id) {
      localStorage.setItem("selectedAddressId_v1", id);
    } else {
      localStorage.removeItem("selectedAddressId_v1");
    }
  } catch (err) {
    console.error("Error saving selected address ID:", err);
  }
};

const initialState = {
  step: "address", // 'address' | 'payment' | 'done'
  addresses: [],
  selectedAddressId: loadSelectedAddressId(),
  shipping: { itemsTotal: 0, shipping: 0, tax: 0, importCharges: 0 },
  shippingType: null, // 'Normal' | 'Express' | null
  payment: { clientSecret: null, orderId: null, status: "idle", lastError: null },
  coupons: [], // Available coupons from start-checkout
  rewards: 0, // Available rewards points
  order: null, // Current active order from startCheckout
  checkoutUpdated: false, // Flag to track if update-checkout was successful (200/201)
  status: "idle",
  error: null,
  isLoadingCheckout: false, // Loading state for startCheckout
  isUpdatingCheckout: false, // Loading state for updateOrderCheckout
};

const slice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    selectAddress(state, action) { 
      state.selectedAddressId = action.payload;
      saveSelectedAddressId(action.payload);
    },
    updateAddressBackendId(state, action) {
      // Update an address with its backendId
      const { localId, backendId } = action.payload;
      const addressIndex = state.addresses.findIndex(addr => addr.id === localId);
      if (addressIndex !== -1) {
        state.addresses[addressIndex] = {
          ...state.addresses[addressIndex],
          backendId: backendId,
        };
      }
    },
    selectShippingType(state, action) {
      state.shippingType = action.payload; // 'Normal' or 'Express'
    },
    goToPayment(state) { state.step = "payment"; },
    resetCheckout() { 
      saveSelectedAddressId(null);
      return {
        ...initialState,
        coupons: [],
        rewards: 0,
        checkoutUpdated: false,
      }; 
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchAddresses.pending, (s) => { s.status = "loading"; })
     .addCase(fetchAddresses.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.addresses = a.payload;
        if (!s.selectedAddressId && s.addresses.length) {
          const def = s.addresses.find(x => x.isDefault) || s.addresses[0];
          s.selectedAddressId = def?.id || null;
          saveSelectedAddressId(s.selectedAddressId);
        }
     })
     .addCase(fetchAddresses.rejected, (s, a) => { s.status = "failed"; s.error = a.error?.message; })

     .addCase(initializeCheckout.pending, (s) => {
        s.isLoadingCheckout = true;
        s.error = null;
     })
     .addCase(initializeCheckout.fulfilled, (s, a) => {
        s.isLoadingCheckout = false;
        s.coupons = a.payload.coupons || [];
        s.rewards = a.payload.rewards || 0;
        s.order = a.payload.order || null; // Store order data
     })
     .addCase(initializeCheckout.rejected, (s, a) => {
        s.isLoadingCheckout = false;
        // If checkout initialization fails, set empty coupons/rewards
        s.coupons = [];
        s.rewards = 0;
        s.order = null;
        s.error = a.payload?.message || a.error?.message || "Failed to start checkout";
     })

     .addCase(updateOrderCheckoutThunk.pending, (s) => {
        s.isUpdatingCheckout = true;
        s.error = null;
     })
     .addCase(updateOrderCheckoutThunk.fulfilled, (s, a) => {
        s.isUpdatingCheckout = false;
        // Only update order if payload.data is actually an order object (not a message)
        // Skip update if it's just a message (e.g., "Skipped: using local address...")
        if (a.payload?.data && typeof a.payload.data === 'object' && a.payload.data.order_code) {
          s.order = a.payload.data; // Update order data only if it's a real order
          console.log("[CheckoutSlice] updateOrderCheckoutThunk.fulfilled - Updated order in state:", {
            order_code: a.payload.data.order_code,
          });
        } else if (a.payload?.skipped) {
          // For skipped updates, keep the existing order (don't overwrite with message)
          console.log("[CheckoutSlice] updateOrderCheckoutThunk.fulfilled - Update skipped, keeping existing order");
        } else if (a.payload?.data && typeof a.payload.data === 'object') {
          // Check if it's a valid order object
          const hasOrderCode = a.payload.data.order_code || a.payload.data.id || a.payload.data.orderCode;
          if (hasOrderCode) {
            s.order = a.payload.data;
          } else {
            console.warn("[CheckoutSlice] updateOrderCheckoutThunk.fulfilled - Payload data is not a valid order, keeping existing order");
          }
        }
        // Mark that checkout has been processed (either updated or skipped)
        // For skipped local addresses, address will be included in final order creation
        s.checkoutUpdated = true;
        s.error = null;
     })
     .addCase(updateOrderCheckoutThunk.rejected, (s, a) => {
        s.isUpdatingCheckout = false;
        s.checkoutUpdated = false;
        s.error = a.payload?.message || a.error?.message || "Failed to update order checkout";
     })

     .addCase(createAddress.pending, (s) => { s.status = "loading"; })
     .addCase(createAddress.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.addresses.push(a.payload);
        s.selectedAddressId = a.payload.id;
        saveSelectedAddressId(a.payload.id);
     })
     .addCase(createAddress.rejected, (s, a) => { 
        s.status = "failed"; 
        s.error = a.error?.message || "Failed to create address";
     })
     .addCase(editAddress.fulfilled, (s, a) => {
        const idx = s.addresses.findIndex(x => x.id === a.payload.id);
        if (idx !== -1) s.addresses[idx] = a.payload;
     })
     .addCase(makeDefaultAddress.fulfilled, (s, a) => {
        const id = a.payload;
        s.addresses = s.addresses.map(x => ({ ...x, isDefault: x.id === id }));
        s.selectedAddressId = id;
        saveSelectedAddressId(id);
     })

     .addCase(fetchShippingQuote.fulfilled, (s, a) => {
        s.shipping = { ...a.payload };
     })

     .addCase(startPayment.pending, (s) => { s.payment.status = "processing"; s.payment.lastError = null; })
     .addCase(startPayment.fulfilled, (s, a) => {
        s.payment.clientSecret = a.payload.clientSecret;
        s.payment.orderId = a.payload.orderId;
        s.payment.status = "ready";
     })
     .addCase(startPayment.rejected, (s, a) => {
        s.payment.status = "error";
        s.payment.lastError = a.error?.message || "Failed to start payment";
     })

     .addCase(confirmOrderThunk.pending, (s) => {
        s.payment.status = "confirming";
     })
     .addCase(confirmOrderThunk.fulfilled, (s, a) => {
        s.step = "done";
        s.payment.status = "succeeded";
        s.payment.orderId = a.payload.orderId;
     })
     .addCase(confirmOrderThunk.rejected, (s, a) => {
        s.payment.status = "error";
        s.payment.lastError = a.error?.message || "Failed to place order";
     });
  },
});

export const { selectAddress, selectShippingType, goToPayment, resetCheckout, updateAddressBackendId } = slice.actions;

export const selectAddresses = (s) => s.checkout.addresses;
export const selectSelectedAddressId = (s) => s.checkout.selectedAddressId;
export const selectCheckoutStep = (s) => s.checkout.step;
export const selectShipping = (s) => s.checkout.shipping;
export const selectShippingTypeValue = (s) => s.checkout.shippingType;
export const selectPaymentState = (s) => s.checkout.payment;
export const selectCoupons = (s) => s.checkout.coupons;
export const selectRewards = (s) => s.checkout.rewards;
export const selectOrder = (s) => s.checkout.order;
export const selectIsLoadingCheckout = (s) => s.checkout.isLoadingCheckout;
export const selectIsUpdatingCheckout = (s) => s.checkout.isUpdatingCheckout;
export const selectCheckoutError = (s) => s.checkout.error;
export const selectCheckoutUpdated = (s) => s.checkout.checkoutUpdated;

export default slice.reducer;
