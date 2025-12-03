import API from "../../axios";
import { INDIAN_DISTRICTS, getCitiesForDistrict, INDIAN_CITIES } from "../../utils/indianLocations";

export const getValidDistricts = async () => {
  try {
    const response = await API.get("/v1/orders/shipping-address/");
    const addresses = Array.isArray(response.data) ? response.data : [];
    
    // Extract unique districts from existing addresses
    const districtsFromAddresses = [...new Set(
      addresses
        .map(addr => addr.district)
        .filter(Boolean)
        .filter(district => district.trim() !== "")
    )];
    
    // If we have districts from addresses, combine with hardcoded list (avoid duplicates)
    if (districtsFromAddresses.length > 0) {
      const allDistricts = [...new Set([...INDIAN_DISTRICTS, ...districtsFromAddresses])];
      return allDistricts.sort();
    }
  } catch (error) {
    console.warn("Error fetching addresses for districts:", error);
  }
  
  // Fallback to hardcoded list
  return INDIAN_DISTRICTS;
};

export const getValidCities = async (district = null) => {
  // First, try to get cities from existing addresses
  try {
    const response = await API.get("/v1/orders/shipping-address/");
    const addresses = Array.isArray(response.data) ? response.data : [];
    
    // Extract unique cities from existing addresses
    let citiesFromAddresses = [...new Set(
      addresses
        .map(addr => addr.city)
        .filter(Boolean)
        .filter(city => city.trim() !== "")
    )];
    
    // If district is specified, filter cities by district
    if (district) {
      const addressesForDistrict = addresses.filter(
        addr => addr.district && addr.district.toLowerCase() === district.toLowerCase()
      );
      citiesFromAddresses = [...new Set(
        addressesForDistrict
          .map(addr => addr.city)
          .filter(Boolean)
          .filter(city => city.trim() !== "")
      )];
    }
    
    // Get cities from hardcoded list based on district
    let hardcodedCities = [];
    if (district) {
      hardcodedCities = getCitiesForDistrict(district);
    } else {
      hardcodedCities = INDIAN_CITIES;
    }
    
    // Combine cities from addresses with hardcoded list (avoid duplicates)
    const allCities = [...new Set([...hardcodedCities, ...citiesFromAddresses])];
    return allCities.sort();
  } catch (error) {
    console.warn("Error fetching addresses for cities:", error);
  }
  
  // Fallback to hardcoded list
  if (district) {
    return getCitiesForDistrict(district);
  }
  return INDIAN_CITIES;
};

export const extractChoicesFromError = (errorResponse) => {
  const choices = { districts: [], cities: [] };
  
  if (!errorResponse?.data) return choices;
  
  // Check if error includes valid choices
  if (errorResponse.data.district?.choices) {
    choices.districts = errorResponse.data.district.choices;
  }
  if (errorResponse.data.city?.choices) {
    choices.cities = errorResponse.data.city.choices;
  }
  
  // Alternative format: error.data might have choices directly
  if (errorResponse.data.choices) {
    if (errorResponse.data.choices.districts) {
      choices.districts = errorResponse.data.choices.districts;
    }
    if (errorResponse.data.choices.cities) {
      choices.cities = errorResponse.data.choices.cities;
    }
  }
  
  return choices;
};

/**
 * Get valid choices from existing addresses
 * This extracts unique districts and cities from user's existing addresses
 * This is the primary source since there are no dedicated endpoints
 */
export const getChoicesFromExistingAddresses = async () => {
  try {
    const response = await API.get("/v1/orders/shipping-address/");
    const addresses = Array.isArray(response.data) ? response.data : [];
    
    const districts = [...new Set(
      addresses
        .map(addr => addr.district)
        .filter(Boolean)
        .filter(district => district.trim() !== "")
    )];
    
    const cities = [...new Set(
      addresses
        .map(addr => addr.city)
        .filter(Boolean)
        .filter(city => city.trim() !== "")
    )];
    
    return { districts, cities };
  } catch (error) {
    console.error("Error fetching existing addresses for choices:", error);
    return { districts: [], cities: [] };
  }
};


