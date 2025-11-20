const memoryStore = {
  cards: [
    {
      id: "card_visa_4242",
      brand: "Visa",
      last4: "4242",
      holder: "Mukesh Reddy",
      expMonth: "12",
      expYear: "2026",
      isDefault: true,
    },
  ],
};

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

export const fetchSavedCards = async () => {
  await delay();
  return { data: { cards: [...memoryStore.cards] } };
};

export const saveCard = async ({ holder, number, expMonth, expYear }) => {
  await delay();
  const last4 = number.slice(-4);
  const brand = number.startsWith("5") ? "Mastercard" : number.startsWith("3") ? "Amex" : "Visa";
  const card = {
    id: `card_${Date.now()}`,
    brand,
    last4,
    holder,
    expMonth,
    expYear,
    isDefault: memoryStore.cards.length === 0,
  };
  memoryStore.cards.push(card);
  return { data: { card } };
};

export const setDefaultCard = async (cardId) => {
  await delay();
  memoryStore.cards = memoryStore.cards.map((card) => ({
    ...card,
    isDefault: card.id === cardId,
  }));
  return { data: { success: true } };
};

export const simulatePhonePeCharge = async ({ amount, vpa }) => {
  await delay(1200);
  if (!vpa.includes("@")) {
    throw new Error("Invalid UPI ID. Please check and try again.");
  }
  return {
    data: {
      status: "succeeded",
      referenceId: `pp_${Date.now()}`,
      amount,
    },
  };
};

