import API from "../../axios";

/**
 * AI Chatbot Service
 * Integrates with OpenAI API for natural, human-like conversations
 * Supports both direct API calls (via backend proxy) and fallback responses
 */

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const CHATBOT_API_URL = process.env.REACT_APP_CHATBOT_API_URL || "/api/v1/chatbot";

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are a friendly and helpful customer service assistant for HyderNexa, a modern e-commerce platform. 
Your role is to assist customers with:
- Order tracking and status
- Returns and refunds
- Shipping information
- Payment methods and issues
- Account management
- Product inquiries
- General customer support

Be conversational, empathetic, and professional. Keep responses concise but helpful. 
If you don't know something, guide them to contact support at support@hydernexa.com or call +91-1800-XXX-XXXX.`;

// Conversation history storage
let conversationHistory = [];

/**
 * Get AI response from OpenAI API (via backend proxy)
 */
export const getAIResponse = async (userMessage, user = null) => {
  try {
    // Add user context if available
    const userContext = user
      ? `User: ${user.name || user.email || "Guest"}. `
      : "";

    const fullMessage = `${userContext}${userMessage}`;

    // Try to call backend API first
    if (CHATBOT_API_URL.startsWith("/api")) {
      try {
        const response = await API.post(CHATBOT_API_URL, {
          message: fullMessage,
          conversation_history: conversationHistory.slice(-10), // Last 10 messages for context
          system_prompt: SYSTEM_PROMPT,
        });

        if (response.data && response.data.response) {
          // Add to conversation history
          conversationHistory.push({ role: "user", content: fullMessage });
          conversationHistory.push({ role: "assistant", content: response.data.response });
          return response.data.response;
        }
      } catch (apiError) {
        console.log("Backend API not available, using fallback:", apiError);
        // Fall through to fallback
      }
    }

    // Fallback: Direct OpenAI API call (if API key is available)
    if (OPENAI_API_KEY && window.fetch) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...conversationHistory.slice(-10),
              { role: "user", content: fullMessage },
            ],
            temperature: 0.7,
            max_tokens: 300,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.choices && data.choices[0] && data.choices[0].message) {
            const aiResponse = data.choices[0].message.content;
            conversationHistory.push({ role: "user", content: fullMessage });
            conversationHistory.push({ role: "assistant", content: aiResponse });
            return aiResponse;
          }
        }
      } catch (openaiError) {
        console.log("OpenAI API error, using intelligent fallback:", openaiError);
        // Fall through to intelligent fallback
      }
    }

    // Intelligent fallback: Enhanced rule-based responses
    return getIntelligentFallback(userMessage, user);
  } catch (error) {
    console.error("Chatbot service error:", error);
    return getIntelligentFallback(userMessage, user);
  }
};

/**
 * Enhanced intelligent fallback with natural language responses
 */
function getIntelligentFallback(userMessage, user) {
  const msg = userMessage.toLowerCase().trim();
  const userName = user?.name || user?.email?.split("@")[0] || "";

  // Greeting responses
  if (msg.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    return userName
      ? `Hello ${userName}! 👋 I'm here to help you with any questions about your orders, returns, shipping, or anything else related to HyderNexa. What can I assist you with today?`
      : `Hello! 👋 Welcome to HyderNexa customer support. I'm here to help you with orders, returns, shipping, payments, and more. How can I assist you today?`;
  }

  // Order tracking
  if (msg.match(/(where|track|status|location).*(order|package|delivery|shipment)/)) {
    if (user) {
      return `I'd be happy to help you track your order${userName ? `, ${userName}` : ""}! 📦 

To view your order status:
1. Go to "Your Orders" in your account
2. Find the order you're looking for
3. Click "Track package" to see real-time updates

Your orders typically arrive within 2-5 business days. If you need more specific information, I can help you find the exact tracking details. Would you like me to guide you through checking a specific order?`;
    }
    return `To track your order, please sign in to your account first. Once signed in, you can:
- Go to "Your Orders" page
- Click "Track package" on any order
- See real-time delivery updates

Would you like help signing in, or do you have an order number I can help you with?`;
  }

  // Returns and refunds
  if (msg.match(/(return|refund|exchange|replace|send back)/)) {
    return `I can help you with returns and refunds! 🔄

**Our Return Policy:**
- Most items can be returned within 30 days of delivery
- Items must be in original condition with tags
- Free return shipping for eligible items

**To Start a Return:**
1. Go to "Your Orders" page
2. Select the item you want to return
3. Click "Return or Replace Items"
4. Follow the prompts to generate a prepaid return label

**Refund Processing:**
- Refunds are processed within 5-7 business days after we receive the item
- Original payment method will be credited

Is there a specific item you'd like to return? I can guide you through the process!`;
  }

  // Shipping information
  if (msg.match(/(ship|shipping|delivery|deliver|how long|when will|arrive)/)) {
    return `Here's our shipping information! 🚚

**Shipping Options:**
- **Standard Shipping:** 3-5 business days (Free on orders over ₹499)
- **Express Shipping:** 1-2 business days (Additional charges apply)
- **Same-Day Delivery:** Available in select cities (Check at checkout)

**Delivery Times:**
- Processing time: 1-2 business days
- Transit time: Depends on shipping method selected
- Some oversized or special items may take longer

**Tracking:**
You'll receive tracking information via email once your order ships. You can also track it in "Your Orders" section.

Would you like to know about shipping to a specific location or have questions about a current order?`;
  }

  // Payment questions
  if (msg.match(/(pay|payment|card|debit|credit|upi|phonepe|google pay|paypal|installment|emi)/)) {
    return `I can help with payment questions! 💳

**Accepted Payment Methods:**
- Credit/Debit Cards (Visa, Mastercard, RuPay, Amex)
- UPI (Google Pay, PhonePe, Paytm, etc.)
- PayPal
- Net Banking
- Cash on Delivery (select areas)

**Security:**
All payments are processed securely with encryption. We never store your full card details.

**EMI Options:**
Yes! We offer EMI (Easy Monthly Installments) on select items. You'll see EMI options at checkout if available.

**Payment Issues:**
If you're experiencing payment problems:
- Check your card/bank account balance
- Verify card details are correct
- Try a different payment method
- Contact your bank if the issue persists

Is there a specific payment issue I can help you resolve?`;
  }

  // Account help
  if (msg.match(/(account|profile|settings|password|login|sign in|sign up|register)/)) {
    return `I can help with account-related questions! 👤

**Account Management:**
- Update profile information in "Your Account"
- Change password in Account Settings
- Manage addresses and payment methods
- View order history

**Sign In Issues:**
If you're having trouble signing in:
- Make sure you're using the correct email
- Try resetting your password
- Check if your account is verified

**Need to Create an Account?**
You can register by clicking "Sign In" and then "Create Account". It only takes a minute!

Would you like help with a specific account issue?`;
  }

  // Product inquiries
  if (msg.match(/(product|item|buy|purchase|available|stock|price)/)) {
    return `I'd be happy to help you find products! 🛍️

**Finding Products:**
- Use the search bar at the top to find specific items
- Browse categories in the menu
- Check product pages for detailed information, reviews, and specifications

**Product Information:**
- Prices, descriptions, and specifications are on each product page
- Stock availability is shown in real-time
- Customer reviews help you make informed decisions

**Need Help Finding Something Specific?**
Just let me know what you're looking for, and I can guide you to the right category or help you search!

Is there a particular product or category you're interested in?`;
  }

  // Contact support
  if (msg.match(/(contact|speak|talk|human|agent|support|help|phone|email|call)/)) {
    return `I'm here to help, but if you need to speak with a human agent, here are your options: 📞

**Contact Options:**
- **Email:** support@hydernexa.com (Response within 24 hours)
- **Phone:** +91-1800-XXX-XXXX (Mon-Sat, 9am-6pm IST)
- **Live Chat:** Available 24/7 (Click the chat icon)

**What I Can Help With:**
- Order tracking and status
- Returns and refunds
- Shipping information
- Payment questions
- Account issues
- Product inquiries

Is there something specific I can help you with right now, or would you prefer to contact our support team directly?`;
  }

  // Cancel order
  if (msg.match(/(cancel|cancellation)/)) {
    return `I can help you cancel an order! ❌

**Cancellation Policy:**
- Orders can be cancelled within 30 minutes of placement
- After 30 minutes, you'll need to wait for delivery and then return the item

**To Cancel:**
1. Go to "Your Orders"
2. Find the order you want to cancel
3. Click "Cancel Order" (if within 30 minutes)
4. Confirm cancellation

**Refund:**
- Cancelled orders are refunded within 5-7 business days
- Refund goes to original payment method

Would you like me to guide you through cancelling a specific order?`;
  }

  // Default helpful response
  return `I'm here to help you with HyderNexa! 🤖

I can assist with:
- 📦 Order tracking and status
- 🔄 Returns and refunds
- 🚚 Shipping information
- 💳 Payment methods and issues
- 👤 Account management
- 🛍️ Product inquiries
- ❌ Order cancellations

Could you tell me more about what you need help with? I'm here to make your shopping experience smooth and enjoyable!`;
}

/**
 * Clear conversation history
 */
export const clearConversationHistory = () => {
  conversationHistory = [];
};

/**
 * Get conversation history
 */
export const getConversationHistory = () => {
  return conversationHistory;
};

