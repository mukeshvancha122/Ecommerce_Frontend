export const formatCurrency = (value, currency="USD", locale) =>
  new Intl.NumberFormat(locale || undefined, { style: "currency", currency }).format(value);

export const percentOff = (list, sale) => {
  if (!list || !sale || sale >= list) return null;
  return `-${Math.round(((list - sale) / list) * 100)}%`;
};