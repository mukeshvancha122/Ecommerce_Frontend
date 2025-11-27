import React, { useState, useRef, useEffect } from "react";
import "./CustomerServicePage.css";
import { useTranslation } from "../../i18n/TranslationProvider";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/auth/AuthSlice";
import { getAIResponse, clearConversationHistory } from "../../api/chatbot/ChatbotService";

export default function CustomerServicePage() {
  const { t } = useTranslation();
  const user = useSelector(selectUser);
  // Start with empty messages - will get actual response from Rasa
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Scroll to bottom only when new messages are added (not while typing)
  const prevMessagesLengthRef = useRef(messages.length);
  useEffect(() => {
    // Only scroll if a new message was actually added
    if (messages.length > prevMessagesLengthRef.current && messagesEndRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setDraft(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event) => {
          console.log("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } catch (error) {
        console.log("Speech recognition not available:", error);
      }
    }
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  // Text-to-speech function with better voice selection
  const speakText = (text) => {
    if (!voiceEnabled) return;
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Try to use a more natural voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (voice) =>
          voice.lang.startsWith("en") &&
          (voice.name.includes("Google") ||
            voice.name.includes("Samantha") ||
            voice.name.includes("Alex") ||
            voice.name.includes("Karen"))
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Handle voice loading
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          const updatedVoices = window.speechSynthesis.getVoices();
          const voice = updatedVoices.find(
            (v) =>
              v.lang.startsWith("en") &&
              (v.name.includes("Google") ||
                v.name.includes("Samantha") ||
                v.name.includes("Alex"))
          );
          if (voice) utterance.voice = voice;
          window.speechSynthesis.speak(utterance);
        };
      } else {
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const sendMessage = async () => {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;

    const userBubble = { from: "user", text: trimmed };
    setMessages((prev) => [...prev, userBubble]);
    const currentDraft = trimmed;
    setDraft("");
    setSending(true);

    try {
      // Get AI response
      const aiResponse = await getAIResponse(currentDraft, user);
      
      // Add bot response
      const botBubble = { from: "bot", text: aiResponse };
      setMessages((prev) => [...prev, botBubble]);
      
      // Speak the bot's response if voice is enabled
      if (voiceEnabled && aiResponse) {
        speakText(aiResponse);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorBubble = {
        from: "bot",
        text: error.message || "Unable to connect to chatbot. Please try again.",
      };
      setMessages((prev) => [...prev, errorBubble]);
      if (voiceEnabled) {
        speakText(errorBubble.text);
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch (error) {
        console.log("Could not start speech recognition:", error);
        setIsListening(false);
      }
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled) {
      window.speechSynthesis.cancel();
    }
  };

  const quickActions = [
    { text: "Track my order", query: "Where is my order?" },
    { text: "Return item", query: "How do I return an item?" },
    { text: "Shipping info", query: "What are shipping times?" },
    { text: "Payment help", query: "What payment methods do you accept?" },
    { text: "Contact support", query: "I need to speak with a human agent" },
  ];

  // Clear conversation on component mount and load voices
  useEffect(() => {
    clearConversationHistory();
    // Load voices for speech synthesis
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const faqCategories = [
    {
      title: "Orders & Shipping",
      items: [
        { q: "How do I track my order?", a: "Go to Your Orders page and click 'Track package' on any order." },
        { q: "What are the shipping options?", a: "We offer standard (3-5 days) and express (1-2 days) shipping." },
        { q: "Can I change my delivery address?", a: "Yes, you can update it in Your Account > Addresses before the order ships." },
      ],
    },
    {
      title: "Returns & Refunds",
      items: [
        { q: "What is the return policy?", a: "Most items can be returned within 30 days of delivery in original condition." },
        { q: "How long do refunds take?", a: "Refunds are processed within 5-7 business days after we receive the item." },
        { q: "Is return shipping free?", a: "Yes, we provide prepaid return labels for eligible items." },
      ],
    },
    {
      title: "Payments",
      items: [
        { q: "What payment methods do you accept?", a: "We accept all major cards, UPI, Google Pay, PhonePe, and PayPal." },
        { q: "Is my payment information secure?", a: "Yes, all payments are encrypted and processed securely." },
        { q: "Can I pay in installments?", a: "Yes, we offer EMI options for select items. Check at checkout." },
      ],
    },
  ];

  return (
    <div className="customer-service-page">
      <div className="cs-container">
        {/* Hero Section */}
        <div className="cs-hero">
          <h1 className="cs-hero-title">Customer Service</h1>
          <p className="cs-hero-subtitle">We're here to help 24/7</p>
        </div>

        <div className="cs-content-grid">
          {/* Left: FAQ & Contact */}
          <div className="cs-info-section">
            {/* FAQ */}
            <div className="cs-faq-section">
              <h2 className="cs-section-title">Frequently Asked Questions</h2>
              {faqCategories.map((category, catIdx) => (
                <div key={catIdx} className="cs-faq-category">
                  <h3 className="cs-faq-category-title">{category.title}</h3>
                  {category.items.map((item, itemIdx) => (
                    <details key={itemIdx} className="cs-faq-item">
                      <summary className="cs-faq-question">{item.q}</summary>
                      <p className="cs-faq-answer">{item.a}</p>
                    </details>
                  ))}
                </div>
              ))}
            </div>

            {/* Contact Options */}
            <div className="cs-contact-section">
              <h2 className="cs-section-title">Contact Us</h2>
              <div className="cs-contact-cards">
                <div className="cs-contact-card">
                  <div className="cs-contact-icon">📧</div>
                  <h3>Email Support</h3>
                  <p>support@hydernexa.com</p>
                  <p className="cs-contact-time">Response within 24 hours</p>
                </div>
                <div className="cs-contact-card">
                  <div className="cs-contact-icon">📞</div>
                  <h3>Phone Support</h3>
                  <p>+91-1800-XXX-XXXX</p>
                  <p className="cs-contact-time">Mon-Sat, 9am-6pm IST</p>
                </div>
                <div className="cs-contact-card">
                  <div className="cs-contact-icon">💬</div>
                  <h3>Live Chat</h3>
                  <p>Available now</p>
                  <p className="cs-contact-time">24/7 support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Chat Assistant */}
          <div className="cs-chat-section">
            <div className="cs-chat-header">
              <div className="cs-chat-header-left">
                <div className="cs-bot-avatar">🤖</div>
                <div>
                  <div className="cs-bot-name">HyderNexa Assistant</div>
                  <div className="cs-bot-status">
                    {sending ? "typing..." : "online"}
                  </div>
                </div>
              </div>
              <div className="cs-chat-controls">
                <button
                  className={`cs-voice-btn ${voiceEnabled ? "active" : ""}`}
                  onClick={toggleVoice}
                  title="Toggle voice"
                >
                  {voiceEnabled ? "🔊" : "🔇"}
                </button>
              </div>
            </div>

            <div className="cs-messages">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`cs-message ${m.from === "user" ? "user" : "bot"}`}
                >
                  <div className="cs-message-content">{m.text}</div>
                </div>
              ))}
              {sending && (
                <div className="cs-message bot">
                  <div className="cs-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="cs-quick-actions">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  className="cs-quick-btn"
                  onClick={() => {
                    setDraft(action.query);
                    setTimeout(() => sendMessage(), 100);
                  }}
                >
                  {action.text}
                </button>
              ))}
            </div>

            <div className="cs-input-section">
              <div className="cs-input-wrapper">
                <button
                  className={`cs-mic-btn ${isListening ? "listening" : ""}`}
                  onClick={startListening}
                  disabled={!recognitionRef.current}
                  title="Voice input"
                >
                  🎤
                </button>
                <textarea
                  className="cs-input"
                  placeholder="Type your question..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                  rows={1}
                />
                <button
                  className="cs-send-btn"
                  onClick={sendMessage}
                  disabled={sending || !draft.trim()}
                >
                  {sending ? "..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

