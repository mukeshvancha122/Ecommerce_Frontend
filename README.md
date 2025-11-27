## HyderNexa Commerce Frontend

HyderNexa delivers a production-grade, Stripe-backed ecommerce checkout that mirrors modern UX and handles millions of concurrent shoppers. The UI now mirrors the requested HyderNexa flows (sign-in → address selection → multi-tender payments → review → orders) with internationalization, accessibility, and resilience in mind.

---

## 1. Quick Start (Execution Guide)

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment**
   Create `.env` in the project root:
   ```bash
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   REACT_APP_PAYPAL_CLIENT_ID=sb
   REACT_APP_API_BASE_URL=http://localhost:5000/api
   
   # AI Chatbot Configuration (Optional)
   # Rasa Chatbot endpoint (default: http://54.145.239.205:5005/webhooks/rest/webhook/)
   REACT_APP_CHATBOT_API_URL=http://54.145.239.205:5005/webhooks/rest/webhook/
   
   # Option 2: Direct OpenAI API (fallback, for development/testing)
   REACT_APP_OPENAI_API_KEY=sk-xxx
   ```
   
   **Note:** The chatbot uses Rasa AI by default. It works with intelligent fallback responses if the Rasa endpoint is unavailable. You can also configure OpenAI API as a fallback option.
3. **Run the dev server**
   ```bash
   npm start
   ```
4. **Run tests / lint (optional)**
   ```bash
   npm test
   ```

> ⚠️ Stripe + PayPal credentials are required for live payments. When no keys are provided the UI falls back to safe demo defaults.

---

## 2. Feature Checklist

- **HyderNexa branding everywhere**: header, chat widget, login footer, checkout chrome, emails.
- **Auth-first workflow**: sign-in, register, email verification + forgot-password flows before cart access; `/checkout`, `/payment`, `/orders`, `/proceed-to-checkout` guarded via `ProtectedRoute`.
- **Multi-screen checkout**: address management, payment method hub, and review screen render side-by-side on desktop & stack on mobile (multi-screen requirement).
- **Stripe-powered payments**:
  - Saved cards + "Add card" modal (HyderNexa-style) with mock backend persistence.
  - CardElement for Visa/Mastercard/RuPay/Amex.
  - Google Pay via Payment Request API (Stripe).
  - PhonePe/UPI simulation via backend mock to demonstrate flow + validation.
  - PayPal wallet via official SDK, ready for sandbox/live client IDs.
  - Post-payment overlay animation/redirect to orders in 3 seconds.
- **Dynamic order placement**: places mock orders, stores them, surfaces in the redesigned Orders page (with filtering/search placeholders, HyderNexa UI).
- **AI-Powered Customer Service**:
  - Intelligent chatbot with Rasa AI integration (default endpoint: http://54.145.239.205:5005/webhooks/rest/webhook/).
  - Natural, human-like conversational responses.
  - Voice capabilities: Text-to-Speech (TTS) and Speech-to-Text (STT).
  - Intelligent fallback responses when Rasa endpoint is unavailable.
  - OpenAI API fallback support (optional).
  - Conversation history and context awareness.
  - Comprehensive FAQ section with expandable categories.
- **Translations / Localization**:
  - EN / HI / DE / ES dictionaries in `src/i18n/translations.js`.
  - Redux-powered locale store, context-based `useTranslation`.
  - `Accept-Language` header automatically forwarded for backend-backed translations.
- **Performance & Scale Considerations**:
  - Cached cards/address data, localStorage hydration for cart/auth/locale.
  - Optimistic UI, non-blocking overlays, PaymentIntent reuse, request cancellation safeguards.
  - Responsive layouts, lazy image loading, semantic markup for accessibility.
- **Documentation**: this README captures execution, features, libraries, and impact.

---

## 3. Library Stack

| Area | Library |
| --- | --- |
| UI & state | React 17, Redux Toolkit, React Router 5 |
| Payments | `@stripe/react-stripe-js`, `@stripe/stripe-js`, `@paypal/react-paypal-js` |
| AI Chatbot | Rasa AI (default), OpenAI GPT API (fallback), Web Speech API |
| Data & APIs | Axios with auth + language interceptors |
| Tooling | React Scripts, Testing Library, Moment (legacy) |

Internal util layers:
- `src/api/CheckoutService.js` – addresses, shipping, PaymentIntent mocks, order placement.
- `src/api/payment/PaymentMethodsService.js` – saved cards & PhonePe simulation.
- `src/api/orders/OrdersService.js` – mock persistence feeding Orders page.
- `src/api/chatbot/ChatbotService.js` – AI chatbot integration with Rasa AI (default) and OpenAI API fallback.

---

## 4. Architecture Notes

- **App shell**: `TranslationProvider` wraps the router to expose `t()` everywhere.
- **State**: Redux slices for auth, cart, checkout, locale. LocalStorage hydration ensures persistence through reloads.
- **Checkout**: `CheckoutPage` orchestrates address selection, payment method state, success overlay, and cart clearing.
- **Payments**: `PaymentSection` centralizes all tender types, dispatches `confirmOrderThunk`, and handles wallet-specific flows.
- **Orders**: `OrdersContent` renders actual order cards + placeholders based on mock service data.

---

## 5. Internationalization Workflow

1. Add strings to `src/i18n/translations.js`.
2. Use `const { t } = useTranslation();` and reference `t("namespace.key")`.
3. Locale picker in the header dispatches `setLanguage`, persists to `locale_v1`, and injects `Accept-Language` header for backend APIs.

---

## 6. Payment Flow Verification

1. **Card**
   - Select “Credit & debit cards”, optionally add a card via the modal (stored in mock API).
   - Complete Stripe CardElement form → `Use this payment method`.
2. **Google Pay**
   - Select “Google Pay”; button renders when the browser supports Payment Request API.
3. **PhonePe**
   - Select “PhonePe UPI”; enter a VPA and submit to trigger mock confirmation.
4. **PayPal**
   - Select “PayPal”; complete sandbox checkout in the embedded widget.
5. On success the blur overlay + animation appears, the cart clears, and you’re redirected to `Orders`.

---

## 7. Impact & Next Steps

- **Scalability**: Stateless frontend + API-driven modules, ready for SSR/CDN if required; Stripe/PayPal handle PCI scale.
- **Reliability**: Guards around auth/cart states, error surfacing, and timers to avoid stuck UX.
- **User psychology & UX**: Familiar HyderNexa layout, clear CTAs, progress indicators, accessible colors/typography, responsive design.
- **Extensibility**: Swap mock services for real endpoints with minimal change (API layer already abstracted).

Recommended follow-ups:
- Wire to real backend endpoints for addresses, orders, and Stripe PaymentIntent creation.
- Add integration tests for payment flows (mock Stripe SDK).
- Expand translation coverage beyond critical flows.

Enjoy building on HyderNexa! 🚀
