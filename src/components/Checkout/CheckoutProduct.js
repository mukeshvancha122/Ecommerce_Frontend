import React from "react";
import "./CheckoutProduct.css";
import { useDispatch } from "react-redux";
import { removeItem, setQty } from "../../features/cart/CartSlice";
import { useCartSync } from "../../hooks/useCartSync";
import { formatCurrency } from "../../utils/format"; // or inline formatter

export default function CheckoutProduct({ id, title, image, price, rating, qty }) {
  const dispatch = useDispatch();
  const { syncRemoveItem, syncUpdateItem } = useCartSync();

  const onRemove = async () => {
    // Remove from local cart
    dispatch(removeItem({ sku: id }));
    // Sync to backend if authenticated
    await syncRemoveItem(id);
  };
  
  const onQtyChange = async (e) => {
    const newQty = Number(e.target.value);
    // Update local cart
    dispatch(setQty({ sku: id, qty: newQty }));
    // Sync to backend if authenticated
    await syncUpdateItem(id, newQty);
  };

  return (
    <div className="checkoutProduct">
      <img className="checkoutProduct-image" src={image} alt={title} />

      <div className="checkoutProduct-info">
        <p className="checkoutProduct-title">{title}</p>

        {typeof rating === "number" && (
          <div className="checkoutProduct-rating">
            {"★".repeat(rating)}{"☆".repeat(Math.max(0, 5 - rating))}
          </div>
        )}

        <div className="checkoutProduct-row">
          <strong className="checkoutProduct-price">{formatCurrency(price, "USD")}</strong>

          <label className="checkoutProduct-qty">
            Qty:{" "}
            <select value={qty} onChange={onQtyChange} aria-label="Quantity">
              {Array.from({ length: 99 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button onClick={onRemove} className="checkoutProduct-remove">
          Remove from Basket
        </button>
      </div>
    </div>
  );
}
