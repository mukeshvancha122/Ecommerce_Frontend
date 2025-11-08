import React, { useState } from "react";
import "./AddressModal.css";
import { useDispatch } from "react-redux";
import { createAddress, editAddress } from "../../features/checkout/CheckoutSlice";

export default function AddressModal({ open, onClose, initial }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(
    initial || {
      country: "United States",
      fullName: "",
      phone: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
    }
  );

  if (!open) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (initial?.id) {
      await dispatch(editAddress({ id: initial.id, payload: form }));
    } else {
      await dispatch(createAddress(form));
    }
    onClose();
  };

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  return (
    <div className="am-backdrop" role="dialog" aria-modal="true">
      <div className="am">
        <div className="am-title">Enter a new shipping address</div>
        <form onSubmit={onSubmit} className="am-form">
          <label>Country/Region
            <select value={form.country} onChange={set("country")}>
              <option>United States</option><option>India</option><option>Canada</option>
            </select>
          </label>

          <label>Full name
            <input value={form.fullName} onChange={set("fullName")} required />
          </label>

          <label>Phone number
            <input value={form.phone} onChange={set("phone")} required />
          </label>

          <label>Address
            <input placeholder="Street address or P.O. Box" value={form.address1} onChange={set("address1")} required />
            <input placeholder="Apt, suite, unit, building, floor, etc." value={form.address2} onChange={set("address2")} />
          </label>

          <div className="am-grid">
            <label>City<input value={form.city} onChange={set("city")} required /></label>
            <label>State<select value={form.state} onChange={set("state")} required>
              <option value="">Select</option><option>CA</option><option>NY</option><option>OH</option>
            </select></label>
            <label>ZIP Code<input value={form.zip} onChange={set("zip")} required /></label>
          </div>

          <div className="am-actions">
            <button type="button" className="am-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="am-primary">Use this address</button>
          </div>
        </form>
      </div>
    </div>
  );
}
