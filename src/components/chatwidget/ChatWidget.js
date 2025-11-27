import React, { useState, useRef, useEffect } from "react";
import "./ChatWidget.css";
import { getAIResponse } from "../../api/chatbot/ChatbotService";

function ChatWidget({ user }) {
  const [isOpen, setIsOpen] = useState(false);

  // conversation - start empty, will get initial message from Rasa if needed
  const [messages, setMessages] = useState([]);

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

  // send message (using Rasa chatbot service)
  const sendMessage = async () => {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;

    const userBubble = { from: "user", text: trimmed };

    // optimistic add user msg
    setMessages((prev) => [...prev, userBubble]);
    setDraft("");
    setSending(true);

    try {
      // Call Rasa chatbot service
      const botResponse = await getAIResponse(trimmed, user);
      
      // Check if response contains product information (indicated by emojis like 🛍️)
      const isProductResponse = botResponse.includes('🛍️') || botResponse.includes('I found');
      
      if (isProductResponse) {
        // For product responses, keep as single message for better readability
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: botResponse },
        ]);
      } else {
        // For regular text responses, split by double newlines to create paragraphs
        const paragraphs = botResponse.split('\n\n').filter(p => p.trim());
        
        if (paragraphs.length > 1) {
          // Multiple paragraphs - display each as separate message
          setMessages((prev) => [
            ...prev,
            ...paragraphs.map((text) => ({ from: "bot", text: text.trim() })),
          ]);
        } else {
          // Single paragraph or short response - display as is
          setMessages((prev) => [
            ...prev,
            { from: "bot", text: botResponse.trim() },
          ]);
        }
      }
    } catch (error) {
      console.error("Error getting bot response:", error);
      // Show error message - user can retry
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: error.message || "Unable to connect to chatbot. Please try again." },
      ]);
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