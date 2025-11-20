import API from "../../axios";

// switch `useMock` off when backend is ready
const useMock = true;

// ---- MOCK DATA (matches your PDP component structure) ----
const mockProduct = {
  id: "p_001",
  slug: "national-tree-6ft-slim-spruce",
  title:
    "National Tree Company 6 ft Pre-Lit North Valley Spruce Slim Artificial Christmas Tree, 250 Clear Lights, 636 Tips, Includes Stand, Green",
  brand: "National Tree Company",
  rating: 4.0,
  reviews: 1010,
  listPrice: 131.24,
  salePrice: 88.99,
  currency: "USD",
  badges: [{ type: "deal", label: "Limited time deal" }],
  details: {
    dimensions: '29"D x 29"W x 72"H',
    color: "Green",
    material: "Metal, Polyvinyl Chloride",
    weight: "12.5 lb",
    packageCount: 1,
  },
  inventory: { inStock: true },
  shipping: {
    cost: 136.49,
    shipsTo: "India",
    eta: "Monday, December 8",
    location: "Hyderabad 500092",
  },
  gallery: {
    hero: "/assets/tree-hero.jpg",
    images: [
      "/assets/tree-1.jpg",
      "/assets/tree-2.jpg",
      "/assets/tree-3.jpg",
      "/assets/tree-4.jpg",
      "/assets/tree-5.jpg",
    ],
  },
  about: [
    "Slim profile 6 ft tree with 29 inch base diameter and 636 branch tips for a full appearance.",
    "250 pre-strung white lights that stay lit even when a bulb goes out.",
    "Pre-attached hinged branches for quick setup and easy storage.",
    "Includes metal stand; realistic PVC needles for lifelike look.",
  ],
  otherSellers: [
    { name: "Festive Store", price: 92.49 },
    { name: "Holiday Hub", price: 94.99 },
  ],
  returnPolicy: "Returnable until Jan 31, 2026",
};

// ---- PUBLIC API ----
export const getProductBySlug = async (slug) => {
  if (useMock) {
    // simulate latency
    await new Promise((r) => setTimeout(r, 400));
    return mockProduct;
  } else {
    const { data } = await API.get(`/products/${slug}`);
    return data;
  }
};

export const getProductById = async (id) => {
  if (useMock) {
    await new Promise((r) => setTimeout(r, 400));
    return { ...mockProduct, id };
  } else {
    const { data } = await API.get(`/products/id/${id}`);
    return data;
  }
};

export const getAllProducts = async () => {
  if (useMock) {
    await new Promise((r) => setTimeout(r, 400));
    return [mockProduct];
  } else {
    const { data } = await API.get("/products");
    return data;
  }
};
