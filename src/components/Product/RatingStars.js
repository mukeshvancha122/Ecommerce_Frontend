import React from "react";

export default function RatingStars({ value=0, outOf=5, size=18 }) {
  const pct = Math.max(0, Math.min(100, (value/outOf)*100));
  return (
    <span aria-label={`${value} out of ${outOf} stars`} role="img" style={{display:"inline-flex", alignItems:"center"}}>
      <span style={{position:"relative", display:"inline-block", width:size*5, height:size}}>
        <span style={{position:"absolute", inset:0, color:"#f59e0b",
          maskImage:`linear-gradient(90deg,#000 0,#000 ${pct}%,transparent ${pct}%)`,
          WebkitMaskImage:`linear-gradient(90deg,#000 0,#000 ${pct}%,transparent ${pct}%)`}}>
          ★★★★★
        </span>
        <span style={{position:"absolute", inset:0, color:"#e5e7eb"}}>★★★★★</span>
      </span>
    </span>
  );
}