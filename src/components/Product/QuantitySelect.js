import React from "react";

export default function QuantitySelect({ value, onChange, max=20, id="qty" }) {
  return (
    <label htmlFor={id} style={{display:"inline-flex", alignItems:"center", gap:8}}>
      <span className="visually-hidden">Quantity</span>
      <select
        id={id}
        value={value}
        onChange={(e)=>onChange(Number(e.target.value))}
        style={{padding:"10px 12px", border:"1px solid var(--border)", borderRadius:12}}
        aria-label="Quantity"
      >
        {Array.from({length:max}, (_,i)=>i+1).map(n => <option key={n} value={n}>{n}</option>)}
      </select>
    </label>
  );
}