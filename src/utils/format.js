// Re-export from currency.js for backward compatibility
export { formatCurrency } from "./currency";

export const percentOff = (list, sale) => {
  if (!list || !sale || sale >= list) return null;
  return `-${Math.round(((list - sale) / list) * 100)}%`;
};