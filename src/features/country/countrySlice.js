import { createSlice } from "@reduxjs/toolkit";

// Country data with currency information
export const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD", symbol: "$", rate: 1 },
  { code: "IN", name: "India", flag: "🇮🇳", currency: "INR", symbol: "₹", rate: 83.5 },
  { code: "CA", name: "Canada", flag: "🇨🇦", currency: "CAD", symbol: "C$", rate: 1.35 },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£", rate: 0.79 },
  { code: "DE", name: "Germany", flag: "🇩🇪", currency: "EUR", symbol: "€", rate: 0.92 },
  { code: "ES", name: "Spain", flag: "🇪🇸", currency: "EUR", symbol: "€", rate: 0.92 },
  { code: "AU", name: "Australia", flag: "🇦🇺", currency: "AUD", symbol: "A$", rate: 1.52 },
];

const getInitialCountry = () => {
  const saved = localStorage.getItem("country_v1");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return COUNTRIES.find((c) => c.code === parsed.code) || COUNTRIES[0];
    } catch {
      return COUNTRIES[0];
    }
  }
  return COUNTRIES[0];
};

const initialState = {
  country: getInitialCountry(),
};

const slice = createSlice({
  name: "country",
  initialState,
  reducers: {
    setCountry(state, action) {
      const country = COUNTRIES.find((c) => c.code === action.payload) || COUNTRIES[0];
      state.country = country;
      localStorage.setItem("country_v1", JSON.stringify({ code: country.code }));
    },
  },
});

export const { setCountry } = slice.actions;
export const selectCountry = (state) => state.country.country;
export default slice.reducer;

