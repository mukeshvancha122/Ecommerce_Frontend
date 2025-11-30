import React, { useMemo, useState } from "react";
import "./BuyBox.css";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { selectUser } from "../../../features/auth/AuthSlice";
import { useCart } from "../../../hooks/useCart";
import { formatCurrency } from "../../../utils/currency";
import { getImageUrl } from "../../../utils/imageUtils";
import QuantitySelect from "../QuantitySelect";

// Utility to parse price values (handles objects with final_price, numbers, strings)
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
  }
  return null;
};

export default function BuyBox({ product }) {
  const history = useHistory();
  const user = useSelector(selectUser);
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const variation = useMemo(() => product?.product_variations?.[0] || {}, [product]);

  const price = useMemo(
    () => parsePrice(variation?.get_discounted_price) || parsePrice(variation?.product_price) || 0,
    [variation]
  );
  const listPrice = parsePrice(variation?.product_price) || 0;
  
  // Handle stock - it can be an object {quantity, text} or a number/string
  const stockQuantity = useMemo(() => {
    const stock = variation?.stock;
    if (!stock) return 0;
    if (typeof stock === 'object' && stock.quantity !== undefined) {
      return Number(stock.quantity) || 0;
    }
    if (typeof stock === 'number') return stock;
    if (typeof stock === 'string') {
      const num = Number(stock);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }, [variation]);
  
  const inStock = stockQuantity > 0;
  const rawHeroImage = variation?.product_images?.[0]?.product_image;
  const heroImage = rawHeroImage ? getImageUrl(rawHeroImage) : "/images/NO_IMG.png";

  const onAdd = async (e) => {
    // Prevent event bubbling and multiple clicks
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Prevent multiple simultaneous calls
    if (onAdd.processing) {
      console.warn("Add to cart already processing, ignoring duplicate call");
      return;
    }
    
    onAdd.processing = true;
    
    const item = {
      sku: variation?.id || product?.id,
      title: product?.product_name,
      price,
      qty,
      image: heroImage,
    };
    
    // Validate item before adding
    if (!item.sku) {
      console.error("Cannot add item: missing variation ID");
      onAdd.processing = false;
      return;
    }
    
    try {
      // Add to cart (works with backend API or localStorage)
      await addItem(item);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      // Reset processing flag after a short delay to prevent rapid clicks
      setTimeout(() => {
        onAdd.processing = false;
      }, 1000);
    }
  };

  return (
    <aside className="buybox card" aria-labelledby="buybox-title">
      <h2 id="buybox-title" className="visually-hidden">
        Purchase options
      </h2>

      <div className="buybox__price">
        <strong>{formatCurrency(price || listPrice)}</strong>
        {listPrice && price < listPrice && (
          <span className="buybox__list">M.R.P: {formatCurrency(listPrice)}</span>
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
          onClick={() => {
            if (!user) {
              // Add to cart first, then redirect to login
              onAdd();
              history.push({
                pathname: "/login",
                state: { from: "/proceed-to-checkout" }
              });
              return;
            }
            // Add to cart and proceed to checkout
            onAdd();
            history.push("/proceed-to-checkout");
          }}
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

