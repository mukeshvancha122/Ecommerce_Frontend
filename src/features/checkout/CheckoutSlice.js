import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAddresses, addAddress, updateAddress, setDefaultAddress,
  getShippingQuote, createPaymentIntent, placeOrder, startCheckout
} from "../../api/CheckoutService";
import { updateCheckout } from "../../api/payment/PaymentService";

export const fetchAddresses = createAsyncThunk("checkout/fetchAddresses", async () => {
  const { data } = await getAddresses();
  return data.addresses || [];
});

export const initializeCheckout = createAsyncThunk("checkout/initializeCheckout", async () => {
  const { data } = await startCheckout();
  return data; // { coupons, rewards, checkoutData }
});

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
  async ({ addressId, items, paymentIntentId, paymentMethod, total, shipping }, { getState, rejectWithValue }) => {
    try {
      // Get address data from state to include in order
      const state = getState();
      const addresses = state.checkout.addresses;
      const address = addressId ? addresses.find(addr => addr.id === addressId) : null;
      const addressData = address?.backendFormat || null;
      
      // Update checkout with shipping info if available (include address data)
      if (addressId && shipping) {
        try {
          await updateCheckout({
            drop_location_id: addressId,
            shipping: JSON.stringify(shipping),
            // Include address data in update
            address: addressData,
          });
        } catch (error) {
          console.warn("Failed to update checkout:", error);
          // Continue with order placement even if update fails
        }
      }

      const { data } = await placeOrder({
        addressId,
        addressData, // Pass address data for shipping
        items,
        paymentIntentId,
        paymentMethod,
        total,
      });
      return data; // { orderId, status }
    } catch (error) {
      // Extract user-friendly error message
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message || 
                           "Failed to place order";
      
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
  payment: { clientSecret: null, orderId: null, status: "idle", lastError: null },
  coupons: [], // Available coupons from start-checkout
  rewards: 0, // Available rewards points
  status: "idle",
  error: null,
};

const slice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    selectAddress(state, action) { 
      state.selectedAddressId = action.payload;
      saveSelectedAddressId(action.payload);
    },
    goToPayment(state) { state.step = "payment"; },
    resetCheckout() { 
      saveSelectedAddressId(null);
      return {
        ...initialState,
        coupons: [],
        rewards: 0,
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

     .addCase(initializeCheckout.fulfilled, (s, a) => {
        s.coupons = a.payload.coupons || [];
        s.rewards = a.payload.rewards || 0;
     })
     .addCase(initializeCheckout.rejected, (s) => {
        // If checkout initialization fails, set empty coupons/rewards
        s.coupons = [];
        s.rewards = 0;
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

export const { selectAddress, goToPayment, resetCheckout } = slice.actions;

export const selectAddresses = (s) => s.checkout.addresses;
export const selectSelectedAddressId = (s) => s.checkout.selectedAddressId;
export const selectCheckoutStep = (s) => s.checkout.step;
export const selectShipping = (s) => s.checkout.shipping;
export const selectPaymentState = (s) => s.checkout.payment;
export const selectCoupons = (s) => s.checkout.coupons;
export const selectRewards = (s) => s.checkout.rewards;

export default slice.reducer;
