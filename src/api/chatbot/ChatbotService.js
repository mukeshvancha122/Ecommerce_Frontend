import API from "../../axios";
/**
 * AI Chatbot Service
 * Integrates with Rasa AI Chatbot for natural, human-like conversations
 * Only uses actual responses from Rasa - no static fallback messages
 */

// Rasa chatbot endpoint - use proxy path to avoid CORS issues
// The proxy forwards to the production endpoint: http://54.145.239.205:5005/webhooks/rest/webhook/
// Using relative path '/api/chatbot' so it goes through the proxy (no CORS)
// Can be overridden via environment variable
const CHATBOT_API_URL = process.env.REACT_APP_CHATBOT_API_URL || '/api/chatbot';

// Contact information for support
const SUPPORT_EMAIL = "support@hydernexa.com";
const SUPPORT_PHONE = "+91-1800-XXX-XXXX"; // Update with actual phone number

// Conversation history storage
let conversationHistory = [];

/**
 * Format Rasa response - handles both text messages and product data
 */
function formatRasaResponse(data) {
  if (!data) return null;

  // Handle array response (Rasa webhook format)
  if (Array.isArray(data) && data.length > 0) {
    const responses = [];
    
    for (const item of data) {
      // Check for text response
      if (item.text) {
        responses.push(item.text);
      }
      
      // Check for custom product data
      if (item.custom && item.custom.results) {
        const productResponse = formatProductData(item.custom.results);
        if (productResponse) {
          responses.push(productResponse);
        }
      }
    }
    
    return responses.length > 0 ? responses.join("\n\n") : null;
  }
  
  // Handle single object with text
  if (data.text) {
    return data.text;
  }
  
  // Handle custom product data directly
  if (data.custom && data.custom.results) {
    return formatProductData(data.custom.results);
  }
  
  return null;
}

/**
 * Format product data into readable text response
 */
function formatProductData(results) {
  if (!results || !results.data || !Array.isArray(results.data) || results.data.length === 0) {
    return null;
  }

  const products = results.data;
  const formattedProducts = products.map((product, index) => {
    let productInfo = `🛍️ ${product.product_name || 'Product'}`;
    
    // Discount information
    if (product.product_discount && product.product_discount > 0) {
      productInfo += ` - ${product.product_discount}% OFF`;
    }
    
    // Product description (truncated if too long)
    if (product.product_description) {
      const desc = product.product_description.length > 150 
        ? product.product_description.substring(0, 150) + '...'
        : product.product_description;
      productInfo += `\n\n${desc}`;
    }
    
    // Category information
    if (product.product_category) {
      productInfo += `\n\n📂 ${product.product_category.category_name || 'N/A'}`;
    }
    
    // Product badges (concise)
    const badges = [];
    if (product.is_top_selling) badges.push("🔥 Top Selling");
    if (product.weekly_drop) badges.push("⭐ Weekly Drop");
    if (product.exciting_deals) badges.push("🎯 Deal");
    if (product.best_seller) badges.push("🏆 Best Seller");
    if (product.free_delivery) badges.push("🚚 Free Delivery");
    
    if (badges.length > 0) {
      productInfo += `\n${badges.join(" • ")}`;
    }
    
    // Rating information
    if (product.get_rating_info && product.get_rating_info.average_rating) {
      const rating = product.get_rating_info;
      productInfo += `\n⭐ ${rating.average_rating.toFixed(1)} (${rating.total_ratings} reviews)`;
    }
    
    // Delivery information (simplified)
    if (product.delivery_by && Array.isArray(product.delivery_by) && product.delivery_by.length > 0) {
      const deliveryTypes = [];
      product.delivery_by.forEach((deliveryOption) => {
        Object.keys(deliveryOption).forEach((type) => {
          deliveryTypes.push(type);
        });
      });
      if (deliveryTypes.length > 0) {
        productInfo += `\n📦 Delivery: ${deliveryTypes.join(", ")} available`;
      }
    }
    
    return productInfo;
  });

  const header = products.length === 1 
    ? "I found this product for you:\n" 
    : `I found ${products.length} products:\n`;
  
  return header + formattedProducts.join("\n\n━━━━━━━━━━━━━━━━━━━━\n\n");
}

/**
 * Get AI response from Rasa Chatbot
 * Supports Rasa webhook endpoint format
 * Only returns actual responses from Rasa - no static fallbacks
 */
export const getAIResponse = async (userMessage, user = null) => {
  // Prepare message for Rasa (just the user message, no context prefix needed)
  const message = userMessage.trim();

  if (!message) {
    throw new Error("Message cannot be empty");
  }

  // Check if URL is absolute (starts with http) or relative
  const isAbsoluteUrl = CHATBOT_API_URL.startsWith("http://") || CHATBOT_API_URL.startsWith("https://");
  
  let response;
  let data;
  
  try {
    if (isAbsoluteUrl) {
      // Direct fetch for absolute URLs (bypasses axios baseURL)
      // Note: This may have CORS issues unless the server allows cross-origin requests
      response = await fetch(CHATBOT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      data = await response.json();
    } else {
      // Use fetch for relative URLs (goes through proxy to production endpoint)
      // Using fetch instead of axios to avoid baseURL conflicts
      response = await fetch(CHATBOT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      data = await response.json();
      console.log("response from chatbot", data);
    }
    
    // Handle Rasa response format
    const formattedResponse = formatRasaResponse(data);
    
    if (!formattedResponse) {
      console.error("Invalid response format from chatbot:", data);
      // Return a user-friendly message with contact information
      return `I apologize, but I'm unable to assist with that request at the moment. This is beyond my current capabilities.\n\nPlease contact our support team for assistance:\n📧 Email: ${SUPPORT_EMAIL}\n📞 Phone: ${SUPPORT_PHONE}\n\nOur support team will be happy to help you with your inquiry.`;
    }
    
    // Add to conversation history
    conversationHistory.push({ role: "user", content: message });
    conversationHistory.push({ role: "assistant", content: formattedResponse });
    
    return formattedResponse;
  } catch (error) {
    console.error("Rasa chatbot API error:", error);
    console.error("Chatbot URL:", CHATBOT_API_URL);
    console.error("Error details:", error.message, error.stack);
    
    // Provide user-friendly error message with contact information
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      return `I apologize, but I'm having trouble connecting right now. Please try again in a moment.\n\nIf the problem persists, please contact our support team:\n📧 Email: ${SUPPORT_EMAIL}\n📞 Phone: ${SUPPORT_PHONE}`;
    } else if (error.message.includes("HTTP error")) {
      return `I apologize, but I'm unable to process your request at the moment. Please try again later.\n\nFor immediate assistance, please contact our support team:\n📧 Email: ${SUPPORT_EMAIL}\n📞 Phone: ${SUPPORT_PHONE}`;
    } else {
      return `I apologize, but I cannot assist with that request. This is beyond my current capabilities.\n\nPlease contact our support team for assistance:\n📧 Email: ${SUPPORT_EMAIL}\n📞 Phone: ${SUPPORT_PHONE}\n\nOur support team will be happy to help you.`;
    }
  }
};


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

