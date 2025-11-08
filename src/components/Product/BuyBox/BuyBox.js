import React, { useState } from "react";
import "./BuyBox.css";
import { useDispatch } from "react-redux";
import { addItem } from "../../../features/cart/CartSlice";
import { formatCurrency } from "../../../utils/format";
import QuantitySelect from "../QuantitySelect";

export default function BuyBox({ product }) {
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);
  const p = product;

  const onAdd = () => {
    dispatch(
      addItem({
        sku: p.sku,
        title: p.title,
        price: p.salePrice ?? p.listPrice,
        qty,
        image: p.gallery?.hero || p.hero,
      })
    );
    // Optional: toast or UI feedback
  };

  return (
    <aside className="buybox card" aria-labelledby="buybox-title">
      <h2 id="buybox-title" className="visually-hidden">Purchase options</h2>

      <div className="buybox__price">
        <strong>{formatCurrency(p.salePrice ?? p.listPrice, p.currency)}</strong>
      </div>

      <div className="buybox__stock">
        <span className={`badge ${p.inventory?.inStock ? "ok" : "nope"}`}>
          {p.inventory?.inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      <div className="buybox__qty">
        <QuantitySelect value={qty} onChange={setQty} />
      </div>

      <div className="buybox__cta">
        <button className="btn btn--primary" onClick={onAdd}>Add to Cart</button>
        <button className="btn btn--accent" onClick={() => alert("Buy Now")}>Buy Now</button>
      </div>

      {/* shipping & returns ... */}
    </aside>
  );
}
