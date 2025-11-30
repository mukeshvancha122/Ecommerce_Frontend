import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/AuthSlice";
import checkoutReducer from "../features/checkout/CheckoutSlice";
import localeReducer from "../features/locale/localeSlice";
import countryReducer from "../features/country/countrySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    checkout: checkoutReducer,
    locale: localeReducer,
    country: countryReducer,
  },
});

  