import { store } from "../store";
import { selectCountry } from "../features/country/countrySlice";

/**
 * Parse price value (handles objects with final_price, numbers, strings)
 */
const parsePrice = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isNaN(value) ? null : value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof value === "object") {
    if ("final_price" in value) return parsePrice(value.final_price);
    if ("amount" in value) return parsePrice(value.amount);
    if ("price" in value) return parsePrice(value.price);
    if ("discounted_price" in value) return parsePrice(value.discounted_price);
  }
  return null;
};

/**
 * Format currency based on selected country
 * @param {number|string|object} amount - Amount (can be number, string, or object with price fields)
 * @param {string} currencyCode - Optional currency code override (defaults to country currency)
 * @param {string} locale - Optional locale override
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = null, locale = null) => {
  const state = store.getState();
  const country = selectCountry(state);
  
  const parsedAmount = parsePrice(amount);
  if (parsedAmount === null || parsedAmount === undefined || parsedAmount === 0) {
    const symbol = country?.symbol || "$";
    return `${symbol}0.00`;
  }
  
  // Use provided currency or country currency (default to INR for India)
  const currency = currencyCode || country?.currency || "INR";
  const symbol = country?.symbol || "₹";
  
  // Assume prices from API are in INR (base currency)
  // Convert to selected country currency if needed
  let finalAmount = parsedAmount;
  
  if (country && country.code !== "IN") {
    // Convert from INR to selected currency
    // Country rates are relative to USD, so we need: INR -> USD -> target currency
    // INR rate is 83.5, meaning 1 USD = 83.5 INR, so 1 INR = 1/83.5 USD
    const inrToUsd = 1 / 83.5;
    const usdAmount = finalAmount * inrToUsd;
    // Convert USD to target currency using country rate
    // Country rate is: 1 USD = country.rate * target currency
    finalAmount = usdAmount * country.rate;
  }
  
  // Format based on currency
  if (currency === "INR") {
    return `₹${parsedAmount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  
  const localeStr = locale || (currency === "INR" ? "en-IN" : "en-US");
  return new Intl.NumberFormat(localeStr, { 
    style: "currency", 
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(finalAmount);
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

