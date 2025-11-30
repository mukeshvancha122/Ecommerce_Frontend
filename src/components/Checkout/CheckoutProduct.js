import React from "react";
import "./CheckoutProduct.css";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/format"; // or inline formatter

export default function CheckoutProduct({ id, title, image, price, rating, qty }) {
  const { removeItem, updateItem } = useCart();

  const onRemove = async () => {
    try {
      await removeItem(id);
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };
  
  const onQtyChange = async (e) => {
    const newQty = Number(e.target.value);
    try {
      await updateItem(id, newQty);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  return (
    <div className="checkoutProduct">
      <img 
        className="checkoutProduct-image" 
        src={image} 
        alt={title}
        onError={(e) => {
          if (e.target.src !== "/images/NO_IMG.png") {
            e.target.src = "/images/NO_IMG.png";
          }
        }}
      />

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
