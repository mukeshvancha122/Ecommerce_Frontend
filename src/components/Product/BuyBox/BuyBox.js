import React, { useMemo, useState } from "react";
import "./BuyBox.css";
import { useDispatch } from "react-redux";
import { addItem } from "../../../features/cart/CartSlice";
import { formatCurrency } from "../../../utils/format";
import QuantitySelect from "../QuantitySelect";
import { getDiscountedPrice, getStockValue } from "../../../utils/productNormalization";

export default function BuyBox({ product }) {
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);
  const variation = useMemo(() => product?.product_variations?.[0] || {}, [product]);

  const price = useMemo(
    () => Number(getDiscountedPrice(variation)),
    [variation]
  );
  const listPrice = Number(variation?.product_price);
  const inStock = Number(getStockValue(variation)) > 0;
  const heroImage = variation?.product_images?.[0]?.product_image;

  const onAdd = () => {
    dispatch(
      addItem({
        sku: variation?.id || product?.id,
        title: product?.product_name,
        price,
        qty,
        image: heroImage,
      })
    );
  };

  return (
    <aside className="buybox card" aria-labelledby="buybox-title">
      <h2 id="buybox-title" className="visually-hidden">
        Purchase options
      </h2>

      <div className="buybox__price">
        <strong>{formatCurrency(price || listPrice, "INR", "en-IN")}</strong>
        {listPrice && price < listPrice && (
          <span className="buybox__list">M.R.P: {formatCurrency(listPrice, "INR", "en-IN")}</span>
        )}
      </div>

      <div className="buybox__stock">
        <span className={`badge ${inStock ? "ok" : "nope"}`}>
          {inStock ? "In Stock" : "Currently unavailable"}
        </span>
      </div>

      <div className="buybox__deliveries">
        <p>{product?.free_delivery ? "FREE delivery available within 2-4 days." : "Delivery charges may apply."}</p>
        <p>Ships from our trusted seller partners.</p>
      </div>

      <div className="buybox__qty">
        <QuantitySelect value={qty} onChange={setQty} />
      </div>

      <div className="buybox__cta">
        <button className="btn btn--primary" onClick={onAdd} disabled={!inStock}>
          Add to Cart
        </button>
        <button
          className="btn btn--accent"
          onClick={() => alert("Proceed to checkout")}
          disabled={!inStock}
        >
          Buy Now
        </button>
      </div>

      <div className="buybox__policy">
        <p>Secure transaction • {product?.returnPolicy || "Easy returns available"}</p>
        <p>Cash on Delivery eligible • 7-day replacement.</p>
      </div>
    </aside>
  );
}

