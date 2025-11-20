import { store } from "../store";
import { selectCountry } from "../features/country/countrySlice";

/**
 * Format currency based on selected country
 * @param {number} amount - Amount in USD
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  const state = store.getState();
  const country = selectCountry(state);
  
  if (!country || !amount) return "$0.00";
  
  const convertedAmount = amount * country.rate;
  
  // Format based on currency
  if (country.currency === "INR") {
    return `₹${convertedAmount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  
  return `${country.symbol}${convertedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = () => {
  const state = store.getState();
  const country = selectCountry(state);
  return country?.symbol || "$";
};

/**
 * Get currency code
 */
export const getCurrencyCode = () => {
  const state = store.getState();
  const country = selectCountry(state);
  return country?.currency || "USD";
};

/**
 * Convert amount to selected country currency
 */
export const convertCurrency = (amount) => {
  const state = store.getState();
  const country = selectCountry(state);
  if (!country || !amount) return 0;
  return amount * country.rate;
};

