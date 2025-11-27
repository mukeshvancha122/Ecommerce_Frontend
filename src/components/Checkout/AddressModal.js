import React, { useState, useEffect, useMemo } from "react";
import "./AddressModal.css";
import { useDispatch, useSelector } from "react-redux";
import { createAddress, editAddress } from "../../features/checkout/CheckoutSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { selectCountry, COUNTRIES } from "../../features/country/countrySlice";
import { selectUser } from "../../features/auth/AuthSlice";
import { getStatesForCountry } from "../../utils/statesData";
import { getValidDistricts, getValidCities, getChoicesFromExistingAddresses, extractChoicesFromError } from "../../api/address/AddressValidationService";

export default function AddressModal({ open, onClose, initial }) {
  const dispatch = useDispatch();
  const selectedCountry = useSelector(selectCountry);
  const user = useSelector(selectUser);
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
      email: user?.email || "", // Include user email
    }
  );
  const [error, setError] = useState("");
  const [validDistricts, setValidDistricts] = useState([]);
  const [validCities, setValidCities] = useState([]);
  const [loadingChoices, setLoadingChoices] = useState(false);
  
  // Update email when user changes
  useEffect(() => {
    if (user?.email && !initial) {
      setForm((prev) => ({ ...prev, email: user.email }));
    }
  }, [user?.email, initial]);
  
  // Load valid districts and cities when modal opens
  // Uses existing address data from shipping endpoint + hardcoded fallback
  useEffect(() => {
    if (!open) return;
    
    const loadValidChoices = async () => {
      setLoadingChoices(true);
      try {
        // Get districts (combines existing addresses + hardcoded list)
        const districts = await getValidDistricts();
        const districtList = Array.isArray(districts) ? districts : [];
        
        if (districtList.length > 0) {
          setValidDistricts(districtList);
        }
        
        // Get all cities (will be filtered by district when district is selected)
        const cities = await getValidCities();
        const cityList = Array.isArray(cities) ? cities : [];
        
        if (cityList.length > 0) {
          setValidCities(cityList);
        }
      } catch (err) {
        console.error("Error loading valid choices:", err);
        // Even on error, hardcoded fallback should be available
      } finally {
        setLoadingChoices(false);
      }
    };
    
    loadValidChoices();
  }, [open]);
  
  // Load cities when district changes (with debounce for performance)
  useEffect(() => {
    if (!form.state || !form.state.trim()) {
      setValidCities([]);
      return;
    }
    
    let isMounted = true;
    const timeoutId = setTimeout(async () => {
      try {
        const cities = await getValidCities(form.state);
        if (!isMounted) return;
        
        const cityList = Array.isArray(cities) 
          ? cities 
          : (cities?.cities || cities?.results || []);
        if (cityList.length > 0) {
          setValidCities(cityList);
        }
      } catch (err) {
        console.error("Error loading cities for district:", err);
      }
    }, 300); // Debounce by 300ms
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [form.state]);

  // Get states for the selected country
  const availableStates = useMemo(() => {
    const countryName = form.country || selectedCountry.name;
    return getStatesForCountry(countryName);
  }, [form.country, selectedCountry.name]);

  // Update country when selected country changes (only for new addresses)
  useEffect(() => {
    if (!initial && open) {
      setForm((prev) => ({ 
        ...prev, 
        country: selectedCountry.name,
        state: "" // Reset state when country changes
      }));
    }
  }, [selectedCountry, open, initial]);
  
  // Reset state when country changes
  useEffect(() => {
    if (form.country && form.country !== selectedCountry.name) {
      setForm((prev) => ({ ...prev, state: "" }));
    }
  }, [form.country, selectedCountry.name]);

  // Close modal on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate email
    const userEmail = form.email || user?.email || "";
    if (!userEmail || !userEmail.trim()) {
      setError("Email is required. Please log in to continue.");
      return;
    }
    
    // Ensure email is included and map state to district
    // Backend expects: email, name, phone (number), full_address, district, city, label
    const districtValue = (form.state || form.district || "").trim();
    const cityValue = (form.city || "").trim();
    
    // Validate that district and city are selected (not empty)
    if (!districtValue) {
      setError("Please select a district from the dropdown.");
      return;
    }
    if (!cityValue) {
      setError("Please select a city from the dropdown.");
      return;
    }
    
    const formData = {
      ...form,
      email: userEmail.trim(),
      district: districtValue, // Use state as district for backend
      city: cityValue, // Ensure city is trimmed
      phone: form.phone ? String(form.phone).replace(/\D/g, '') : "", // Clean phone number (remove non-digits)
    };
    
    console.log("Form data being sent:", formData);
    
    try {
      if (initial?.id) {
        await dispatch(editAddress({ id: initial.id, payload: formData })).unwrap();
      } else {
        await dispatch(createAddress(formData)).unwrap();
      }
      // Success - close modal
      onClose();
    } catch (err) {
      // Try to extract valid choices from error response
      if (err?.response) {
        const extractedChoices = extractChoicesFromError(err.response);
        if (extractedChoices.districts.length > 0) {
          setValidDistricts(extractedChoices.districts);
        }
        if (extractedChoices.cities.length > 0) {
          setValidCities(extractedChoices.cities);
        }
      }
      
      // Handle validation errors from backend
      let errorMessage = "Failed to create address";
      
      if (err?.email || err?.district || err?.city) {
        errorMessage = "Please fix the following errors:\n";
        if (err.email) {
          errorMessage += `• Email: ${Array.isArray(err.email) ? err.email.join(", ") : err.email}\n`;
        }
        if (err.district) {
          errorMessage += `• District: ${Array.isArray(err.district) ? err.district.join(", ") : err.district}\n`;
          if (validDistricts.length > 0) {
            errorMessage += `  Valid options: ${validDistricts.slice(0, 10).join(", ")}${validDistricts.length > 10 ? "..." : ""}\n`;
          } else {
            errorMessage += "  Note: Please select a district from the dropdown.\n";
          }
        }
        if (err.city) {
          errorMessage += `• City: ${Array.isArray(err.city) ? err.city.join(", ") : err.city}\n`;
          if (validCities.length > 0) {
            errorMessage += `  Valid options: ${validCities.slice(0, 10).join(", ")}${validCities.length > 10 ? "..." : ""}\n`;
          } else {
            errorMessage += "  Note: Please select a city from the dropdown.\n";
          }
        }
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      console.error("Address creation error:", err);
    }
  };

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  return (
    <div 
      className="am-backdrop" 
      role="dialog" 
      aria-modal="true"
      onClick={handleBackdropClick}
      style={{ pointerEvents: open ? "auto" : "none" }}
    >
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
            <label>District/State
              {loadingChoices ? (
                <div style={{ color: "#666", fontSize: "0.875rem", padding: "8px", fontStyle: "italic" }}>
                  Loading districts...
                </div>
              ) : (
                <select 
                  value={form.state} 
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, state: e.target.value, city: "" })); // Reset city when district changes
                  }} 
                  required
                  style={{ width: "100%", padding: "8px", fontSize: "1rem", minHeight: "40px" }}
                >
                  <option value="">-- Select District --</option>
                  {validDistricts.length > 0 ? (
                    validDistricts.map((district, idx) => {
                      const districtValue = typeof district === 'string' ? district : (district.value || district.name || district);
                      const districtLabel = typeof district === 'string' ? district : (district.label || district.name || district.value || district);
                      return (
                        <option key={idx} value={districtValue}>
                          {districtLabel}
                        </option>
                      );
                    })
                  ) : (
                    // Show common districts as fallback
                    <>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Rangareddy">Rangareddy</option>
                      <option value="Medchal-Malkajgiri">Medchal-Malkajgiri</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Pune">Pune</option>
                      <option value="Bangalore Urban">Bangalore Urban</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Kolkata">Kolkata</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Ahmedabad">Ahmedabad</option>
                      <option value="Surat">Surat</option>
                      <option value="Jaipur">Jaipur</option>
                      <option value="Lucknow">Lucknow</option>
                      <option value="Kanpur">Kanpur</option>
                      <option value="Nagpur">Nagpur</option>
                      <option value="Indore">Indore</option>
                    </>
                  )}
                </select>
              )}
              {!loadingChoices && (
                <small style={{ color: "#666", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>
                  Select a district from the dropdown
                </small>
              )}
            </label>
            <label>City
              {loadingChoices && !form.state ? (
                <div style={{ color: "#999", fontSize: "0.875rem", padding: "8px", fontStyle: "italic" }}>
                  Select district first
                </div>
              ) : (
                <select 
                  value={form.city} 
                  onChange={set("city")} 
                  required 
                  disabled={!form.state}
                  style={{ 
                    width: "100%", 
                    padding: "8px", 
                    fontSize: "1rem", 
                    minHeight: "40px",
                    opacity: form.state ? 1 : 0.6,
                    cursor: form.state ? "pointer" : "not-allowed"
                  }}
                >
                  <option value="">-- Select City --</option>
                  {validCities.length > 0 ? (
                    validCities.map((city, idx) => {
                      const cityValue = typeof city === 'string' ? city : (city.value || city.name || city);
                      const cityLabel = typeof city === 'string' ? city : (city.label || city.name || city.value || city);
                      return (
                        <option key={idx} value={cityValue}>
                          {cityLabel}
                        </option>
                      );
                    })
                  ) : form.state ? (
                    // Show common cities when district is selected but no cities loaded
                    <>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Secunderabad">Secunderabad</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Kolkata">Kolkata</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Pune">Pune</option>
                      <option value="Ahmedabad">Ahmedabad</option>
                      <option value="Surat">Surat</option>
                      <option value="Jaipur">Jaipur</option>
                      <option value="Lucknow">Lucknow</option>
                      <option value="Kanpur">Kanpur</option>
                      <option value="Nagpur">Nagpur</option>
                      <option value="Indore">Indore</option>
                    </>
                  ) : null}
                </select>
              )}
              {!loadingChoices && !form.state && (
                <small style={{ color: "#999", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>
                  Please select a district first
                </small>
              )}
            </label>
            <label>ZIP Code<input value={form.zip} onChange={set("zip")} required /></label>
          </div>

          {error && (
            <div style={{ 
              color: "#b12704", 
              backgroundColor: "#ffe5e5", 
              padding: "12px", 
              borderRadius: "4px", 
              marginBottom: "16px",
              fontSize: "0.875rem",
              whiteSpace: "pre-line"
            }}>
              {error}
            </div>
          )}
          
          <div className="am-actions">
            <button type="button" className="am-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="am-primary">Use this address</button>
          </div>
        </form>
      </div>
    </div>
  );
}
