import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAddresses, addAddress, updateAddress, setDefaultAddress,
  getShippingQuote, createPaymentIntent, placeOrder
} from "../../api/CheckoutService";

export const fetchAddresses = createAsyncThunk("checkout/fetchAddresses", async (_, { rejectWithValue }) => {
  try {
    const { data } = await getAddresses();
    // Handle different response structures
    if (Array.isArray(data)) {
      return data;
    }
    if (data?.addresses && Array.isArray(data.addresses)) {
      return data.addresses;
    }
    if (data?.results && Array.isArray(data.results)) {
      return data.results;
    }
    // If no addresses found, return empty array (not an error)
    return [];
  } catch (error) {
    // Return empty array instead of throwing error
    console.warn("Failed to fetch addresses from backend, using empty list:", error);
    return [];
  }
});

export const createAddress = createAsyncThunk("checkout/createAddress", async (payload) => {
  // addAddress already handles errors and returns a response, so this should never throw
  const response = await addAddress(payload);
  const { data } = response;
  
  // Handle different response structures from backend
  const address = data?.address || data?.data || data;
  
  // Ensure address has required fields
  if (address) {
    // Map common field variations
    const normalizedAddress = {
      id: address.id || address.address_id || Date.now(),
      fullName: address.fullName || address.full_name || address.name || payload.fullName,
      phone: address.phone || address.phone_number || payload.phone,
      address1: address.address1 || address.address_1 || address.line1 || address.street_address || payload.address1,
      address2: address.address2 || address.address_2 || address.line2 || payload.address2 || "",
      city: address.city || payload.city,
      state: address.state || address.state_province || payload.state,
      zip: address.zip || address.zip_code || address.postal_code || payload.zip,
      country: address.country || payload.country,
      isDefault: address.isDefault || address.is_default || false,
    };
    
    // Log if this is a local address (no backend ID)
    if (!address.id && !address.address_id) {
      console.log("✅ Address saved locally (backend unavailable):", normalizedAddress);
    }
    
    return normalizedAddress;
  }
  
  // Fallback: return payload with generated ID
  return {
    ...payload,
    id: Date.now(),
    isDefault: false,
  };
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
        // Normalize addresses to ensure consistent structure
        const normalizedAddresses = a.payload.map(addr => ({
          id: addr.id || addr.address_id,
          fullName: addr.fullName || addr.full_name || addr.name,
          phone: addr.phone || addr.phone_number,
          address1: addr.address1 || addr.address_1 || addr.line1 || addr.street_address,
          address2: addr.address2 || addr.address_2 || addr.line2 || "",
          city: addr.city,
          state: addr.state || addr.state_province,
          zip: addr.zip || addr.zip_code || addr.postal_code,
          country: addr.country,
          isDefault: addr.isDefault || addr.is_default || false,
        })).filter(addr => addr.id); // Filter out addresses without IDs
        
        // Preserve locally created addresses (those with timestamp IDs > 1e12 are likely local)
        // Local addresses have IDs like Date.now() which are > 1e12
        const localAddresses = s.addresses.filter(addr => {
          // If address ID is a large number (timestamp), it's likely a local address
          // Also check if it's not in the normalized addresses from backend
          const isLocal = typeof addr.id === 'number' && addr.id > 1e12;
          const notInBackend = !normalizedAddresses.find(ba => ba.id === addr.id);
          return isLocal && notInBackend;
        });
        
        // Merge backend addresses with local addresses, avoiding duplicates
        const allAddresses = [...normalizedAddresses];
        localAddresses.forEach(localAddr => {
          const exists = allAddresses.find(addr => 
            addr.address1 === localAddr.address1 && 
            addr.city === localAddr.city &&
            addr.zip === localAddr.zip
          );
          if (!exists) {
            allAddresses.push(localAddr);
          }
        });
        
        s.addresses = allAddresses;
        
        // Preserve selected address if it still exists, otherwise select default or first
        if (s.selectedAddressId) {
          const stillExists = s.addresses.find(addr => addr.id === s.selectedAddressId);
          if (!stillExists) {
            s.selectedAddressId = null;
          }
        }
        
        if (!s.selectedAddressId && s.addresses.length) {
          const def = s.addresses.find(x => x.isDefault) || s.addresses[0];
          s.selectedAddressId = def?.id || null;
        }
     })
     .addCase(fetchAddresses.rejected, (s, a) => { s.status = "failed"; s.error = a.error?.message; })

     .addCase(createAddress.fulfilled, (s, a) => {
        const newAddress = a.payload;
        // Ensure the address has an id
        if (!newAddress.id && newAddress.address_id) {
          newAddress.id = newAddress.address_id;
        }
        // Check if address already exists (avoid duplicates)
        const exists = s.addresses.find(addr => addr.id === newAddress.id);
        if (!exists && newAddress.id) {
          s.addresses.push(newAddress);
        }
        // Select the new address
        if (newAddress.id) {
          s.selectedAddressId = newAddress.id;
        }
     })
     .addCase(createAddress.rejected, (s, a) => {
        console.error("Failed to create address on backend:", a.error);
        // Even if backend fails, try to create address locally from the payload
        const payload = a.meta?.arg || a.payload?.payload;
        if (payload) {
          const localAddress = {
            ...payload,
            id: Date.now(), // Temporary ID
            isDefault: false,
          };
          // Check if address already exists (avoid duplicates)
          const exists = s.addresses.find(addr => 
            addr.address1 === localAddress.address1 && 
            addr.city === localAddress.city &&
            addr.zip === localAddress.zip
          );
          if (!exists) {
            s.addresses.push(localAddress);
            s.selectedAddressId = localAddress.id;
            console.log("✅ Address saved locally (backend unavailable):", localAddress);
          }
        }
        s.error = a.payload?.error || a.error?.message || "Failed to create address";
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
