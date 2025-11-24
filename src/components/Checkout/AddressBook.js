import React from "react";
import { useSelector } from "react-redux";
import { selectCountry } from "../../features/country/countrySlice";
import "./AddressBook.css";

export default function AddressBook({ addresses, selectedId, onSelect, onAddNew, onChangeClick, onCountryMismatch }) {
  const selectedCountry = useSelector(selectCountry);
  
  // Map country names to codes for comparison
  const countryNameToCode = {
    "United States": "US",
    "India": "IN",
    "Canada": "CA",
    "United Kingdom": "GB",
    "Germany": "DE",
    "Spain": "ES",
    "Australia": "AU",
  };

  const handleAddressSelect = (address) => {
    const addressCountryCode = countryNameToCode[address.country] || address.country;
    
    // Check if address country matches selected country
    if (addressCountryCode !== selectedCountry.code) {
      if (onCountryMismatch) {
        onCountryMismatch(selectedCountry.name, address.country);
      }
      return;
    }
    
    onSelect(address.id);
  };

  // Show message if no addresses
  if (!addresses || addresses.length === 0) {
    return (
      <div className="ab">
        <div className="ab-empty">
          <p>No addresses found. Add a new address to continue.</p>
        </div>
        <div className="ab-addRow">
          <button type="button" className="ab-link" onClick={onAddNew}>Add a new delivery address</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ab">
      {addresses.map((a) => {
        const addressCountryCode = countryNameToCode[a.country] || a.country;
        const isMismatch = addressCountryCode !== selectedCountry.code;
        
        return (
          <label 
            key={a.id} 
            className={`ab-item ${selectedId === a.id ? "is-selected" : ""} ${isMismatch ? "ab-item-disabled" : ""}`}
          >
            <input
              type="radio"
              name="addr"
              checked={selectedId === a.id}
              onChange={() => handleAddressSelect(a)}
              disabled={isMismatch}
            />
            <div className="ab-body">
              <div className="ab-name">{a.fullName}</div>
              <div className="ab-lines">
                {a.address1}{a.address2 ? `, ${a.address2}` : ""}, {a.city}, {a.state} {a.zip}, {a.country}
              </div>
              {isMismatch && (
                <div className="ab-country-warning">
                  ⚠️ Address is outside {selectedCountry.name}
                </div>
              )}
              <div className="ab-phone">Phone: {a.phone}</div>
              <div className="ab-actions">
                <button type="button" className="ab-link" onClick={onChangeClick}>Edit address</button>
                {a.isDefault && <span className="ab-default">Default</span>}
              </div>
            </div>
          </label>
        );
      })}

      <div className="ab-addRow">
        <button type="button" className="ab-link" onClick={onAddNew}>Add a new delivery address</button>
      </div>
    </div>
  );
}