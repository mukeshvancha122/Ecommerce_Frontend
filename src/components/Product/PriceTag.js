import React from "react";
import { formatCurrency, percentOff } from "../../utils/format";

export default function PriceTag({ list, sale, currency }) {
  const off = percentOff(list, sale);
  return (
    <div style={{display:"flex", alignItems:"baseline", gap:12}}>
      <div style={{fontSize:28, fontWeight:700}}>{formatCurrency(sale, currency)}</div>
      {list && sale && sale < list && (
        <>
          <s style={{color:"var(--muted)"}}>{formatCurrency(list, currency)}</s>
          {off && <span className="badge" aria-label={`${off} off`}>{off}</span>}
        </>
      )}
    </div>
  );
}