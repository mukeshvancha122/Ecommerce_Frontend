import API from "../../axios";

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

const mockProfile = {
  id: "usr_001",
  name: "Mukesh Reddy",
  email: "mukeshvancha122@gmail.com",
  primaryPhone: "+91 91825 13118",
  passkeyEnabled: false,
  passwordLastChanged: "2025-01-04T10:00:00.000Z",
  addresses: [
    {
      id: "home",
      label: "Default Home",
      line1: "103, 5-55/3/1, Vajra Residency",
      line2: "Mallikarjun Nagar, Hyderabad",
      city: "Hyderabad",
      state: "Telangana",
      zip: "500092",
      country: "India",
      phone: "+91 94412 82440",
    },
    {
      id: "office",
      label: "Office",
      line1: "301, Sai Ganga Residency",
      line2: "Pipe Line Rd, Jeedimetla",
      city: "Hyderabad",
      state: "Telangana",
      zip: "500055",
      country: "India",
      phone: "+91 99496 87659",
    },
  ],
  preferences: {
    language: "English",
    country: "India",
    currency: "INR (₹)",
  },
  security: {
    lastLogin: "2025-02-15T08:15:00.000Z",
    devices: [
      { id: "iphone15", label: "iPhone 15 Pro", location: "Hyderabad, India", lastUsed: "2025-02-15" },
      { id: "macbook", label: "MacBook Pro (Safari)", location: "Hyderabad, India", lastUsed: "2025-02-13" },
    ],
  },
  payments: [
    { id: "card_visa_4242", brand: "Visa", last4: "4242", exp: "12/26" },
    { id: "card_rupay_5555", brand: "RuPay", last4: "5555", exp: "05/27" },
  ],
};

export const fetchProfileSummary = async () => {
  try {
    const { data } = await API.get("/account/profile");
    return {
      data: {
        ...mockProfile,
        ...data,
        addresses: data?.addresses?.length ? data.addresses : mockProfile.addresses,
        payments: data?.payments?.length ? data.payments : mockProfile.payments,
        security: { ...mockProfile.security, ...(data?.security || {}) },
        preferences: { ...mockProfile.preferences, ...(data?.preferences || {}) },
      },
    };
  } catch (error) {
    await delay();
    return { data: mockProfile };
  }
};

