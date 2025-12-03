# Order Placement Flow - Complete Explanation

This document explains the complete order placement flow from checkout to order confirmation in the Ecommerce Frontend application.

---

## Overview

The order placement flow consists of **5 main stages**:

1. **Checkout Initialization** - Create order in backend
2. **Address Selection** - User selects/creates shipping address
3. **Payment Method Selection** - User chooses payment method (Card/UPI/COD)
4. **Order Confirmation** - Process payment and place order
5. **Order Confirmation Page** - Display order details and clear cart

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   1. CHECKOUT PAGE                               │
│  User navigates to /proceed-to-checkout                         │
│  ↓                                                               │
│  CheckoutPage component loads                                    │
│  ↓                                                               │
│  startCheckout() called → Creates order in backend              │
│  GET /v1/orders/start-checkout/                                 │
│  ↓                                                               │
│  Order created with status: PENDING                              │
│  Order stored in Redux state: checkout.order                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   2. ADDRESS SELECTION                           │
│  User selects or creates shipping address                        │
│  ↓                                                               │
│  Address stored in Redux: checkout.addresses                    │
│  Address synced to backend if new:                               │
│  POST /v1/orders/shipping-address/                              │
│  ↓                                                               │
│  updateOrderCheckout() called (if numeric ID):                   │
│  POST /v1/orders/update-checkout/                               │
│  { drop_location_id, shipping: "Normal/Express" }                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   3. PAYMENT SECTION                             │
│  PaymentSection component renders                                │
│  User selects payment method: Card / UPI / COD                  │
│  ↓                                                               │
│  User clicks "Pay" button                                       │
│  ↓                                                               │
│  handleConfirmCard() / handleUPI() / handleCOD() called         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   4. ORDER CONFIRMATION                          │
│  finalizeOrder() called (inside PaymentSection)                 │
│  ↓                                                               │
│  confirmOrderThunk() dispatched (Redux Thunk)                   │
│  ↓                                                               │
│  Step 1: Check if order exists in Redux state                   │
│    - If not, call startCheckout() to create order               │
│    - Fetch current order with retries if needed                 │
│  ↓                                                               │
│  Step 2: Update checkout (if address has backend ID)            │
│    POST /v1/orders/update-checkout/                              │
│  ↓                                                               │
│  Step 3: Place order                                            │
│    placeOrder() called                                          │
│    - Fetches current order from backend                          │
│    - Returns orderCode                                          │
│  ↓                                                               │
│  Step 4: Process payment (in PaymentSection)                     │
│    processOrderPayment() called                                  │
│    POST /v1/payments/order-payment/                              │
│    { payment_method, amount, order_code, ref_code }             │
│  ↓                                                               │
│  Step 5: Redirect to Order Confirmation Page                    │
│    history.push("/order-confirmation?orderId=xxx")              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   5. ORDER CONFIRMATION PAGE                     │
│  OrderConfirmationPage component loads                          │
│  ↓                                                               │
│  useEffect: Call update-checkout API                            │
│    POST /v1/orders/update-checkout/                              │
│  ↓                                                               │
│  Clear cart from backend and localStorage                       │
│    DELETE /v1/cart/clear/                                       │
│  ↓                                                               │
│  Display order confirmation details                             │
│  - Order ID, items, total, shipping address                      │
│  - Download receipt option                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detailed Step-by-Step Flow

### Stage 1: Checkout Initialization

**File:** `src/pages/CheckoutPage/CheckoutPage.js`

**What happens:**
1. User navigates to `/proceed-to-checkout`
2. `CheckoutPage` component mounts
3. `startCheckout()` is called automatically
4. Creates an order in the backend with status `PENDING`

**API Call:**
```javascript
GET /v1/orders/start-checkout/
```

**Response:**
```json
{
  "order": {
    "id": 123,
    "order_code": "ORD-123456",
    "order_status": "PENDING",
    "item": []
  }
}
```

**Redux State:**
- `checkout.order` = Order object from backend
- Order is stored in Redux for later use

---

### Stage 2: Address Selection

**File:** `src/components/Checkout/AddressModal.js`

**What happens:**
1. User selects existing address or creates new one
2. If new address:
   - `createShippingAddress()` called
   - `POST /v1/orders/shipping-address/`
   - Address saved to backend and localStorage
3. If address has backend ID (numeric):
   - `updateOrderCheckoutThunk()` called
   - `POST /v1/orders/update-checkout/`
   - Updates order with shipping address

**API Call (Create Address):**
```javascript
POST /v1/orders/shipping-address/
{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": 1234567890,
  "full_address": "123 Main St",
  "district": "Mumbai",
  "city": "Mumbai",
  "label": "Home"
}
```

**API Call (Update Checkout):**
```javascript
POST /v1/orders/update-checkout/
{
  "drop_location_id": 123,  // Backend address ID
  "shipping": "Normal"       // or "Express"
}
```

---

### Stage 3: Payment Method Selection

**File:** `src/components/Checkout/PaymentSection.js`

**What happens:**
1. User selects payment method:
   - **Card**: Credit/Debit card
   - **UPI**: UPI ID (PhonePe, Google Pay, etc.)
   - **COD**: Cash on Delivery
2. User fills payment details (if required)
3. User clicks "Pay" button

**Payment Methods:**
- `handleConfirmCard()` - Card payments
- `handleUPI()` - UPI payments
- `handleCOD()` - Cash on Delivery

---

### Stage 4: Order Confirmation (The Main Flow)

**File:** `src/components/Checkout/PaymentSection.js` → `src/features/checkout/CheckoutSlice.js`

#### Step 4.1: finalizeOrder() Function

**Location:** `src/components/Checkout/PaymentSection.js`

```javascript
const finalizeOrder = async (paymentIntentId, paymentMethod) => {
  // Dispatch confirmOrderThunk Redux action
  const result = await dispatch(confirmOrderThunk({
    addressId: selectedAddressId,
    items: cartItems,
    paymentIntentId: paymentIntentId,
    paymentMethod: paymentMethod,
    total: orderTotal,
    shipping: shippingData,
  }));
  
  // Returns orderId (order_code)
  return result.payload?.orderId;
};
```

#### Step 4.2: confirmOrderThunk() Redux Thunk

**Location:** `src/features/checkout/CheckoutSlice.js`

**What it does:**

1. **Check for existing order:**
   ```javascript
   let order = state.checkout.order;
   if (!order || !order.order_code) {
     // Call startCheckout() to create order
     const { data } = await startCheckout();
     order = data.order;
   }
   ```

2. **Get order code:**
   ```javascript
   const orderCode = order.order_code || order.id;
   ```

3. **Update checkout (if address has backend ID):**
   ```javascript
   if (isNumericId && shipping) {
     await updateCheckout({
       drop_location_id: Number(addressId),
       shipping: JSON.stringify(shipping),
     });
   }
   ```

4. **Place order:**
   ```javascript
   const { data } = await placeOrder({
     addressId,
     addressData,
     items,
     paymentIntentId,
     paymentMethod,
     total,
     orderCode,  // CRITICAL: Pass order code
   });
   ```

5. **Clear cart:**
   ```javascript
   await clearCartBackend();  // Clear backend cart
   ```

6. **Return order ID:**
   ```javascript
   return {
     orderId: data.orderId,
     status: "succeeded",
   };
   ```

#### Step 4.3: placeOrder() Function

**Location:** `src/api/CheckoutService.js`

**What it does:**

1. **Fetch current order from backend:**
   ```javascript
   const currentOrderResponse = await getCurrentOrder();
   const currentOrder = currentOrderResponse.data;
   const orderCode = currentOrder.order_code || currentOrder.id;
   ```

2. **Validate order exists:**
   - If `orderCode` provided in payload, verify it exists
   - If not provided, fetch current order
   - Throw error if order not found

3. **Return order data:**
   ```javascript
   return {
     data: {
       orderId: orderCode,
       order: currentOrder,
       status: "succeeded",
     },
   };
   ```

**Note:** Payment processing happens **separately** in `PaymentSection` component.

#### Step 4.4: Process Payment

**Location:** `src/components/Checkout/PaymentSection.js`

**After order is created, payment is processed:**

```javascript
// For Card payments
await processOrderPayment({
  payment_method: "card",
  amount: String(orderTotal),
  order_code: orderId,
  ref_code: `card_${Date.now()}`,
});

// For COD
await processOrderPayment({
  payment_method: "cod",
  amount: String(orderTotal),
  order_code: orderId,
  ref_code: `cod_${Date.now()}`,
});
```

**API Call:**
```javascript
POST /v1/payments/order-payment/
{
  "payment_method": "card",  // or "cod", "esewa", "khalti"
  "amount": "199.99",
  "order_code": "ORD-123456",
  "ref_code": "card_1234567890"
}
```

#### Step 4.5: Redirect to Confirmation

```javascript
history.push({
  pathname: "/order-confirmation",
  search: `?orderId=${orderId}`,
  state: {
    orderId,
    items,
    orderTotal,
    shipping,
    addressId,
    shippingType,
  }
});
```

---

### Stage 5: Order Confirmation Page

**File:** `src/pages/OrderConfirmationPage/OrderConfirmationPage.js`

**What happens:**

1. **Component mounts:**
   - Extracts `orderId` from URL query params
   - Gets order data from `location.state`

2. **Call update-checkout API:**
   ```javascript
   useEffect(() => {
     if (addressId && shippingType && !updateCheckoutCalledRef.current) {
       dispatch(updateOrderCheckoutThunk({
         shipping_address_id: addressId,
         shipping_type: shippingType,
       }));
     }
   }, [orderId]);
   ```

3. **Clear cart:**
   ```javascript
   useEffect(() => {
     if (orderId && !cartClearedRef.current) {
       clearCart();  // Clear backend and localStorage
       cartClearedRef.current = true;
     }
   }, [orderId]);
   ```

4. **Display order confirmation:**
   - Order ID
   - Items list
   - Total amount
   - Shipping address
   - Estimated delivery date
   - Download receipt button

---

## Key Functions and Their Roles

### 1. startCheckout()
**Location:** `src/api/CheckoutService.js`
**Purpose:** Creates initial order in backend
**API:** `GET /v1/orders/start-checkout/`
**Returns:** Order object with `order_code`

### 2. getCurrentOrder()
**Location:** `src/api/CheckoutService.js`
**Purpose:** Fetches the current active order
**API:** `GET /v1/orders/current-order/`
**Returns:** Current order object

### 3. createShippingAddress()
**Location:** `src/api/CheckoutService.js`
**Purpose:** Creates shipping address in backend
**API:** `POST /v1/orders/shipping-address/`
**Returns:** Created address with backend ID

### 4. updateOrderCheckout()
**Location:** `src/api/payment/PaymentService.js`
**Purpose:** Updates order with shipping address and type
**API:** `POST /v1/orders/update-checkout/`
**Payload:** `{ drop_location_id, shipping }`

### 5. placeOrder()
**Location:** `src/api/CheckoutService.js`
**Purpose:** Finalizes order placement (fetches order, validates)
**Returns:** Order ID and order data

### 6. processOrderPayment()
**Location:** `src/api/payment/PaymentService.js`
**Purpose:** Processes payment for the order
**API:** `POST /v1/payments/order-payment/`
**Payload:** `{ payment_method, amount, order_code, ref_code }`

### 7. confirmOrderThunk()
**Location:** `src/features/checkout/CheckoutSlice.js`
**Purpose:** Orchestrates the entire order confirmation flow
**Calls:** `startCheckout()`, `updateCheckout()`, `placeOrder()`, `clearCartBackend()`

---

## Data Flow

### Redux State Management

**Initial State:**
```javascript
checkout: {
  order: null,           // Order object from backend
  addresses: [],         // Shipping addresses
  selectedAddressId: null,
  shipping: {},          // Shipping costs
}
```

**After startCheckout():**
```javascript
checkout: {
  order: {
    id: 123,
    order_code: "ORD-123456",
    order_status: "PENDING",
    item: []
  },
  ...
}
```

**After confirmOrderThunk():**
```javascript
checkout: {
  order: {
    id: 123,
    order_code: "ORD-123456",
    order_status: "CONFIRMED",  // Updated after payment
    item: [...items],
    payment: [...]
  },
  ...
}
```

---

## Error Handling

### Common Errors and Solutions

1. **"No current order found"**
   - **Cause:** `startCheckout()` wasn't called or failed
   - **Solution:** `confirmOrderThunk()` automatically calls `startCheckout()` if order missing

2. **"Order code not provided"**
   - **Cause:** Order exists but doesn't have `order_code`
   - **Solution:** Falls back to `order.id` or generates temporary code

3. **"Update checkout failed"**
   - **Cause:** Address ID is not numeric (local storage address)
   - **Solution:** Update is skipped, address included in order creation instead

4. **"Payment processing failed"**
   - **Cause:** Payment API error or invalid payment method
   - **Solution:** Error shown to user, order remains in PENDING status

---

## Important Notes

### Order Code Flow

1. **Created by:** `startCheckout()` → Backend generates `order_code`
2. **Stored in:** Redux state (`checkout.order.order_code`)
3. **Used in:** `placeOrder()` and `processOrderPayment()`
4. **Critical:** Order code must exist before payment processing

### Address Handling

1. **Backend Addresses (numeric ID):**
   - Can be used in `update-checkout` API
   - Synced with backend

2. **Local Addresses (string ID like `addr_xxx`):**
   - Cannot be used in `update-checkout` API
   - Included in order creation payload instead

### Payment Processing

1. **Dummy Mode:** Payment is bypassed, order created directly
2. **Real Mode:** Payment processed via `/v1/payments/order-payment/`
3. **Payment Methods:** `card`, `cod`, `esewa`, `khalti`, `upi`

### Cart Clearing

1. **When:** After successful order placement
2. **Where:** In `confirmOrderThunk()` and `OrderConfirmationPage`
3. **What:** Backend cart (`DELETE /v1/cart/clear/`) and localStorage

---

## Summary

The order placement flow is a **multi-stage process** that:

1. ✅ Creates order in backend (`startCheckout`)
2. ✅ Manages shipping addresses (create/sync)
3. ✅ Updates order with address (`update-checkout`)
4. ✅ Places order (`placeOrder`)
5. ✅ Processes payment (`processOrderPayment`)
6. ✅ Clears cart (backend + localStorage)
7. ✅ Displays confirmation page

All stages are **logged extensively** for debugging, and errors are handled gracefully with user-friendly messages.

---

## Files Involved

- `src/pages/CheckoutPage/CheckoutPage.js` - Checkout page
- `src/components/Checkout/PaymentSection.js` - Payment UI and handlers
- `src/components/Checkout/AddressModal.js` - Address management
- `src/features/checkout/CheckoutSlice.js` - Redux thunks and state
- `src/api/CheckoutService.js` - Order and address API calls
- `src/api/payment/PaymentService.js` - Payment processing
- `src/pages/OrderConfirmationPage/OrderConfirmationPage.js` - Confirmation page

---

**This flow ensures orders are properly created, paid for, and confirmed in the backend while maintaining a smooth user experience.**

