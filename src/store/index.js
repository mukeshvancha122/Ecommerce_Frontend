import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../features/cart/CartSlice";
import authReducer from "../features/auth/AuthSlice";
import checkoutReducer from "../features/checkout/CheckoutSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    checkout: checkoutReducer
  },
});

  