import React, { useState, useEffect } from "react";
import "./AddressModal.css";
import { useDispatch, useSelector } from "react-redux";
import { createAddress, editAddress, fetchAddresses } from "../../features/checkout/CheckoutSlice";
import { selectCountry, COUNTRIES } from "../../features/country/countrySlice";

export default function AddressModal({ open, onClose, initial }) {
  const dispatch = useDispatch();
  const selectedCountry = useSelector(selectCountry);
  const [form, setForm] = useState(
    initial || {
      country: selectedCountry.name,
      fullName: "",
      phone: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
    }
  );

  // Update country when selected country changes (only for new addresses)
  useEffect(() => {
    if (!initial && open) {
      setForm((prev) => ({ ...prev, country: selectedCountry.name }));
    }
  }, [selectedCountry, open, initial]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setForm(
        initial || {
          country: selectedCountry.name,
          fullName: "",
          phone: "",
          address1: "",
          address2: "",
          city: "",
          state: "",
          zip: "",
        }
      );
    }
  }, [open, initial, selectedCountry]);

  if (!open) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (initial?.id) {
        const result = await dispatch(editAddress({ id: initial.id, payload: form }));
        if (editAddress.fulfilled.match(result)) {
          // Refetch addresses to ensure we have the latest data
          await dispatch(fetchAddresses());
          onClose();
        } else {
          console.error("Failed to update address:", result.error);
        }
      } else {
        const result = await dispatch(createAddress(form));
        // If address creation succeeded, close modal immediately
        // Don't refetch if address was created locally (backend unavailable)
        if (createAddress.fulfilled.match(result)) {
          console.log("✅ Address created successfully:", result.payload);
          const createdAddress = result.payload;
          
          // Only refetch if the address has a backend ID (not a timestamp ID)
          // Timestamp IDs (Date.now()) are > 1e12, backend IDs are typically smaller
          const isLocalAddress = typeof createdAddress.id === 'number' && createdAddress.id > 1e12;
          
          if (!isLocalAddress) {
            // Address was saved to backend, refetch to get latest data
            const refetchResult = await dispatch(fetchAddresses());
            console.log("✅ Addresses refetched from backend:", refetchResult.payload);
          } else {
            console.log("✅ Address saved locally, skipping refetch to preserve local address");
          }
          
          onClose();
        } else {
          console.error("❌ Failed to create address:", result.error);
          // Don't close modal on error so user can try again
        }
      }
    } catch (error) {
      console.error("Error submitting address form:", error);
    }
  };

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  return (
    <div className="am-backdrop" role="dialog" aria-modal="true">
      <div className="am">
        <div className="am-title">Enter a new shipping address</div>
        <form onSubmit={onSubmit} className="am-form">
          <label>Country/Region
            <select value={form.country} onChange={set("country")}>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.name}>
                  {country.flag} {country.name}
                </option>
              ))}
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
