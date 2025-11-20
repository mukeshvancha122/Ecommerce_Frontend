import React from "react";
import "./PriceTag.css";
import { formatCurrency, percentOff } from "../../utils/format";

export default function PriceTag({ list, sale, currency }) {
  const off = percentOff(list, sale);
  const salePrice = sale ?? list ?? 0;

  return (
    <div className="priceTag">
      <div className="priceTag__sale">{formatCurrency(salePrice, currency)}</div>
      {list && sale && sale < list && (
        <>
          <span className="priceTag__list">{formatCurrency(list, currency)}</span>
          {off && (
            <span className="priceTag__badge" aria-label={`${off} off`}>
              {off} off
            </span>
          )}
        </>
      )}
    </div>
  );
}