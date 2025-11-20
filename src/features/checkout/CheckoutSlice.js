import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAddresses, addAddress, updateAddress, setDefaultAddress,
  getShippingQuote, createPaymentIntent, placeOrder
} from "../../api/CheckoutService";

export const fetchAddresses = createAsyncThunk("checkout/fetchAddresses", async () => {
  const { data } = await getAddresses();
  return data.addresses || [];
});

export const createAddress = createAsyncThunk("checkout/createAddress", async (payload) => {
  const { data } = await addAddress(payload);
  return data.address;
});

export const editAddress = createAsyncThunk("checkout/editAddress", async ({ id, payload }) => {
  const { data } = await updateAddress(id, payload);
  return data.address;
});

export const makeDefaultAddress = createAsyncThunk("checkout/makeDefaultAddress", async (id) => {
  await setDefaultAddress(id);
  return id;
});

export const fetchShippingQuote = createAsyncThunk("checkout/fetchShippingQuote", async () => {
  const { data } = await getShippingQuote();
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
  async ({ addressId, items, paymentIntentId, paymentMethod, total }) => {
    const { data } = await placeOrder({
      addressId,
      items,
      paymentIntentId,
      paymentMethod,
      total,
    });
    return data; // { orderId, status }
  }
);

const initialState = {
  step: "address", // 'address' | 'payment' | 'done'
  addresses: [],
  selectedAddressId: null,
  shipping: { itemsTotal: 0, shipping: 0, tax: 0, importCharges: 0 },
  payment: { clientSecret: null, orderId: null, status: "idle", lastError: null },
  status: "idle",
  error: null,
};

const slice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    selectAddress(state, action) { state.selectedAddressId = action.payload; },
    goToPayment(state) { state.step = "payment"; },
    resetCheckout() { return initialState; },
  },
  extraReducers: (b) => {
    b.addCase(fetchAddresses.pending, (s) => { s.status = "loading"; })
     .addCase(fetchAddresses.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.addresses = a.payload;
        if (!s.selectedAddressId && s.addresses.length) {
          const def = s.addresses.find(x => x.isDefault) || s.addresses[0];
          s.selectedAddressId = def?.id || null;
        }
     })
     .addCase(fetchAddresses.rejected, (s, a) => { s.status = "failed"; s.error = a.error?.message; })

     .addCase(createAddress.fulfilled, (s, a) => {
        s.addresses.push(a.payload);
        s.selectedAddressId = a.payload.id;
     })
     .addCase(editAddress.fulfilled, (s, a) => {
        const idx = s.addresses.findIndex(x => x.id === a.payload.id);
        if (idx !== -1) s.addresses[idx] = a.payload;
     })
     .addCase(makeDefaultAddress.fulfilled, (s, a) => {
        const id = a.payload;
        s.addresses = s.addresses.map(x => ({ ...x, isDefault: x.id === id }));
        s.selectedAddressId = id;
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

export default slice.reducer;
