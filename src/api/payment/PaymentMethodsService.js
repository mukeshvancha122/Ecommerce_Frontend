import API from "../../axios";

/**
 * Fetch Saved Cards
 * Bypasses backend and returns dummy data
 */
export const fetchSavedCards = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Return dummy cards structure
  const dummyCards = [
    {
      id: 1,
      holder: "John Doe",
      last4: "4242",
      brand: "Visa",
      expMonth: "12",
      expYear: "2025",
      isDefault: true
    },
    {
      id: 2,
      holder: "John Doe",
      last4: "5555",
      brand: "Mastercard",
      expMonth: "06",
      expYear: "2026",
      isDefault: false
    }
  ];
  
  console.log("✅ Fetched saved cards (using dummy data):", dummyCards);
  
  return {
    data: {
      cards: dummyCards
    }
  };
};

/**
 * Save Card
 * Bypasses backend and returns dummy data immediately
 */
export const saveCard = async ({ holder, number, expMonth, expYear }) => {
  // Simulate network delay for realistic UX
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Determine card brand based on first digit
  const firstDigit = number.charAt(0);
  let brand = "Visa";
  if (firstDigit === "4") {
    brand = "Visa";
  } else if (firstDigit === "5") {
    brand = "Mastercard";
  } else if (firstDigit === "3") {
    brand = "American Express";
  } else if (firstDigit === "6") {
    brand = "Discover";
  }
  
  // Create dummy card object
  const dummyCard = {
    id: Date.now(),
    holder: holder || "Card Holder",
    number: number.slice(-4), // Store only last 4 digits
    last4: number.slice(-4),
    brand: brand,
    expMonth: expMonth || "12",
    expYear: expYear || new Date().getFullYear().toString(),
    isDefault: false,
  };
  
  console.log("✅ Card saved (using dummy data):", dummyCard);
  
  return {
    data: {
      card: dummyCard,
      message: "Card saved successfully"
    }
  };
};

/**
 * Set Default Card
 * POST /api/v1/payment/cards/{id}/default/ or POST /api/v1/payment-methods/cards/{id}/default/
 */
export const setDefaultCard = async (cardId) => {
  try {
    try {
      const response = await API.post(`/api/v1/payment/cards/${cardId}/default/`);
      return response;
    } catch (e) {
      const response = await API.post(`/api/v1/payment-methods/cards/${cardId}/default/`);
      return response;
    }
  } catch (error) {
    console.error("Error setting default card:", error);
    throw error;
  }
};

/**
 * Simulate PhonePe Charge (UPI Payment)
 * POST /api/v1/payment/phonepe/charge/ or POST /api/v1/payment/upi/charge/
 */
export const simulatePhonePeCharge = async ({ amount, vpa }) => {
  try {
    if (!vpa.includes("@")) {
      throw new Error("Invalid UPI ID. Please check and try again.");
    }
    
    try {
      const response = await API.post("/api/v1/payment/phonepe/charge/", {
        amount,
        vpa,
      });
      return response;
    } catch (e) {
      const response = await API.post("/api/v1/payment/upi/charge/", {
        amount,
        vpa,
      });
      return response;
    }
  } catch (error) {
    console.error("Error processing PhonePe charge:", error);
    throw error;
  }
};

