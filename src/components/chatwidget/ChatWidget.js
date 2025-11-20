import React, { useState, useRef, useEffect } from "react";
import "./ChatWidget.css";

function getBotReply(userText, user) {
  const msg = userText.toLowerCase().trim();

  // simple intent-ish matching
  if (
    msg.includes("where") &&
    msg.includes("order")
  ) {
    // Example: If user is logged in, we can personalize a bit
    if (user) {
      return [
        `I can help with your order, ${user.name || user.email || "there"}!`,
        "Your recent orders usually arrive within 2-5 business days.",
        "For detailed tracking, go to Orders > Track Order.",
      ];
    }
    return [
      "To track an order, please sign in first.",
      "After signing in, go to Orders > Track Order to see live delivery updates.",
    ];
  }

  if (msg.includes("return")) {
    return [
      "Our return window is 30 days from delivery for most items.",
      "To start a return: Go to Orders, select the item, and choose 'Return / Replace'.",
      "We’ll generate a prepaid label if the item qualifies.",
    ];
  }

  if (
    msg.includes("ship") ||
    msg.includes("shipping") ||
    msg.includes("deliver") ||
    msg.includes("delivery")
  ) {
    return [
      "Standard shipping: 3–5 business days.",
      "Express shipping: 1–2 business days.",
      "Some oversized items or hazmat items may need extra time.",
    ];
  }

  if (msg.includes("help") || msg.includes("hi") || msg.includes("hello")) {
    return [
      "Hi there 👋",
      "You can ask things like:",
      "• Where is my order?",
      "• How do I start a return?",
      "• What are shipping times?",
    ];
  }

  if (msg.includes("contact") || msg.includes("agent") || msg.includes("human")) {
    return [
      "You can contact support at support@hydernexa.com.",
      "Live chat with a human is available 9am–6pm IST.",
    ];
  }

  // default fallback
  return [
    "I'm here to help with orders, returns, shipping and account questions.",
    "Try asking something like: 'Where is my order?' or 'How do I return an item?'",
  ];
}

function ChatWidget({ user }) {
  const [isOpen, setIsOpen] = useState(false);

  // conversation
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! 👋 I'm here to help. Ask about orders, returns, shipping times, etc.",
    },
  ]);

  // user input
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // scroll to bottom when messages change or panel opens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // toggle chat window
  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  // session id for context (front-end only, no backend networking)
  function getSessionId() {
    let sid = sessionStorage.getItem("chatSessionId");
    if (!sid) {
      sid = "sess_" + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem("chatSessionId", sid);
    }
    return sid;
  }

  // send message (frontend-only)
  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;

    const userBubble = { from: "user", text: trimmed };

    // optimistic add user msg
    setMessages((prev) => [...prev, userBubble]);
    setDraft("");
    setSending(true);

    // generate "bot" reply fully on the client
    const replies = getBotReply(trimmed, user, getSessionId());

    // fake delay for realism (feel free to remove setTimeout if you want instant)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        ...replies.map((text) => ({ from: "bot", text })),
      ]);
      setSending(false);
    }, 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating bubble button */}
      <button
        className="chat-launcher"
        onClick={toggleOpen}
        aria-label="Chat support"
      >
        <div className="chat-launcher-icon">💬</div>
        {!isOpen && <div className="chat-launcher-badge">Help</div>}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="chat-panel" role="dialog" aria-modal="false">
          {/* Header */}
          <div className="chat-panel-header">
            <div className="chat-header-left">
              <div className="chat-bot-avatar">🛍️</div>
              <div className="chat-header-text">
                <div className="chat-bot-name">Customer Support</div>
                <div className="chat-bot-status">
                  {sending ? "typing…" : "online"}
                </div>
              </div>
            </div>

            <button
              className="chat-close-btn"
              onClick={toggleOpen}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={
                  m.from === "user"
                    ? "chat-bubble chat-bubble-user"
                    : "chat-bubble chat-bubble-bot"
                }
              >
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-bar">
            <textarea
              className="chat-input"
              placeholder="Type your question…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              rows={1}
            />

            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={sending || !draft.trim()}
            >
              {sending ? "…" : "Send"}
            </button>
          </div>

          {/* Quick action chips */}
          <div className="chat-quick-row">
            <button
              className="chat-quick-chip"
              onClick={() => setDraft("Where is my order?")}
            >
              Track order
            </button>
            <button
              className="chat-quick-chip"
              onClick={() => setDraft("How do I start a return?")}
            >
              Returns
            </button>
            <button
              className="chat-quick-chip"
              onClick={() => setDraft("Do you ship internationally?")}
            >
              Shipping
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatWidget;