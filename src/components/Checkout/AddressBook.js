import React from "react";
import "./AddressBook.css";

export default function AddressBook({ addresses, selectedId, onSelect, onAddNew, onChangeClick }) {
  return (
    <div className="ab">
      {addresses.map((a) => (
        <label key={a.id} className={`ab-item ${selectedId === a.id ? "is-selected" : ""}`}>
          <input
            type="radio"
            name="addr"
            checked={selectedId === a.id}
            onChange={() => onSelect(a.id)}
          />
          <div className="ab-body">
            <div className="ab-name">{a.fullName}</div>
            <div className="ab-lines">
              {a.address1}{a.address2 ? `, ${a.address2}` : ""}, {a.city}, {a.state} {a.zip}, {a.country}
            </div>
            <div className="ab-phone">Phone: {a.phone}</div>
            <div className="ab-actions">
              <button type="button" className="ab-link" onClick={onChangeClick}>Edit address</button>
              {a.isDefault && <span className="ab-default">Default</span>}
            </div>
          </div>
        </label>
      ))}

      <div className="ab-addRow">
        <button type="button" className="ab-link" onClick={onAddNew}>Add a new delivery address</button>
      </div>
    </div>
  );
}