import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegCommentDots } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { FiX } from "react-icons/fi";
import styles from "./chatbot.module.scss";
import { useAppContext } from "../../context/AppContext";

const API_URL = "https://df37-118-70-118-224.ngrok-free.app22";

const ChatBox = () => {
  const { isAuthenticated } = useAppContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          {
            role: "assistant",
            content:
              "Hello! I'm Tira's virtual assistant. How can I help you today?",
          },
        ]);
        setIsTyping(false);
      }, 1000);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleLinkClick = (productId) => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    navigate(`/product/${productId}`);
    setIsOpen(false);
  };

  // Hàm xử lý và render nội dung tin nhắn, bao gồm các liên kết
  const renderMessageContent = (content) => {
    const linkRegex = /http:\/\/localhost:5173\/product\/(\d+)/g;
    const parts = content.split(linkRegex);

    return parts.map((part, index) => {
      const match = content.match(linkRegex);
      if (match && index % 2 === 1) {
        const productId = match[Math.floor(index / 2)].split("/").pop();
        return (
          <a
            key={index}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick(productId);
            }}
            className={styles.messageLink}
          >
            View Product {productId}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const updatedMessages = [
      {
        role: "system",
        content:
          "You are a virtual assistant of Tira Shop. Help customers find products or give advice.",
      },
      ...messages,
      userMessage,
    ];

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await response.json();

      let botMessage;
      if (!isAuthenticated) {
        botMessage = {
          role: "assistant",
          content:
            "Please log in to view product details. You can log in here: http://localhost:5173/auth",
        };
      } else {
        botMessage = { role: "assistant", content: data };
      }

      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, Math.random() * 1000 + 500);
    } catch (error) {
      console.error("API Error:", error);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Connection error. Please try again later!",
          },
        ]);
        setIsTyping(false);
      }, 500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={styles.chatContainer}>
      {isOpen && (
        <div className={styles.chatBox}>
          <div className={styles.chatHeader}>
            <h3>Tira Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className={styles.closeButton}
              aria-label="Close chat"
            >
              <FiX />
            </button>
          </div>

          <div className={styles.chatMessages}>
            {messages.length === 0 ? (
              <p className={styles.placeholderText}>
                Starting a new conversation...
              </p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={styles.messageRow}
                  style={{
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    className={
                      msg.role === "user"
                        ? styles.userMessage
                        : styles.assistantMessage
                    }
                  >
                    <div className={styles.messageContent}>
                      {renderMessageContent(msg.content)}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div
                className={styles.messageRow}
                style={{ justifyContent: "flex-start" }}
              >
                <div className={styles.assistantMessage}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputContainer}>
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.inputField}
              ref={inputRef}
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              className={styles.sendButton}
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
            >
              <IoMdSend />
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.toggleButton}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <FaRegCommentDots />
      </button>
    </div>
  );
};

export default ChatBox;