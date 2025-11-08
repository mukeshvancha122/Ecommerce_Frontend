import React from "react";
import "./ProductInfo.css";
import RatingStars from "../RatingStars";
import PriceTag from "../PriceTag";

export default function ProductInfo({ product }) {
  const p = product;
  return (
    <section className="pinfo card" aria-labelledby="p-title">
      <h1 id="p-title" className="pinfo__title">{p.title}</h1>

      <div className="pinfo__meta">
        <span>Brand: <a href="/">{p.brand}</a></span>
        <span className="pinfo__reviews">
          <RatingStars value={p.rating} />
          <a href="/"> {p.reviews} ratings</a>
        </span>
      </div>

      <div className="hr" />

      <div className="pinfo__dealrow">
        {p.badges?.map((b) => (
          <span key={b.label} className="badge">{b.label}</span>
        ))}
      </div>

      <PriceTag list={p.listPrice} sale={p.salePrice} currency={p.currency} />

      <dl className="pinfo__specs">
        <div><dt>Brand</dt><dd>{p.brand}</dd></div>
        <div><dt>Product Dimensions</dt><dd>{p.details.dimensions}</dd></div>
        <div><dt>Color</dt><dd>{p.details.color}</dd></div>
        <div><dt>Material</dt><dd>{p.details.material}</dd></div>
        <div><dt>Item Weight</dt><dd>{p.details.weight}</dd></div>
        <div><dt>Item Package</dt><dd>{p.details.packageCount}</dd></div>
      </dl>
    </section>
  );
}