import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../features/cart/CartSlice";
import authReducer from "../features/auth/AuthSlice";
import checkoutReducer from "../features/checkout/CheckoutSlice";
import localeReducer from "../features/locale/localeSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    checkout: checkoutReducer,
    locale: localeReducer,
  },
});

  