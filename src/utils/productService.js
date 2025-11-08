export async function fetchProductBySlug(slug){
  await new Promise(r => setTimeout(r, 250));
  return {
    id: "p_001",
    sku: "NTC-SLIM-6FT",
    slug,
    title: "National Tree Company 6 ft Pre-Lit North Valley Spruce Slim Artificial Christmas Tree, 250 Clear Lights, 636 Tips, Includes Stand, Green",
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
      weight: "12.5 Pounds",
      packageCount: 1
    },
    shipping: {
      cost: 136.49,
      shipsTo: "India",
      eta: "Monday, December 8",
      location: "Hyderabad 500092"
    },
    inventory: { inStock: true },
    gallery: {
      hero: "/assets/tree-hero.jpg",
      images: [
        "/assets/tree-1.jpg",
        "/assets/tree-2.jpg",
        "/assets/tree-3.jpg",
        "/assets/tree-4.jpg",
        "/assets/tree-5.jpg"
      ]
    },
    about: [
      "Slim profile 6 ft tree with 29 inch base diameter and 636 branch tips.",
      "250 pre-strung white lights that stay lit even when a bulb goes out.",
      "Pre-attached, hinged branches for quick setup and easy storage.",
      "Includes durable metal stand; realistic PVC needles for a lifelike look."
    ],
    otherSellers: [
      { name: "Seasonal Depot", price: 92.49 },
      { name: "Festive Outlet", price: 94.99 }
    ],
    returnPolicy: "Returnable until Jan 31, 2026"
  };
}