import { useDispatch, useSelector } from "react-redux";
import { addItem, removeItem, setQty, clearCart, incrementQty, decrementQty } from "../features/cart/CartSlice";
import { selectCartItems } from "../features/cart/CartSlice";

/**
 * Custom hook for cart operations
 * Provides simple cart functions that work with localStorage
 */
export const useCartSync = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);

  /**
   * Add item to cart
   */
  const syncAddItem = (item) => {
    dispatch(addItem(item));
  };

  /**
   * Update item quantity
   */
  const syncUpdateItem = (sku, qty) => {
    dispatch(setQty({ sku, qty }));
  };

  /**
   * Remove item from cart
   */
  const syncRemoveItem = (sku) => {
    dispatch(removeItem({ sku }));
  };

  /**
   * Clear entire cart
   */
  const syncClearCart = () => {
    dispatch(clearCart());
  };

  /**
   * Increment item quantity
   */
  const syncIncrementQty = (sku) => {
    dispatch(incrementQty({ sku }));
  };

  /**
   * Decrement item quantity
   */
  const syncDecrementQty = (sku) => {
    dispatch(decrementQty({ sku }));
  };

  return {
    syncAddItem,
    syncUpdateItem,
    syncRemoveItem,
    syncClearCart,
    syncIncrementQty,
    syncDecrementQty,
    cartItems,
  };
};
