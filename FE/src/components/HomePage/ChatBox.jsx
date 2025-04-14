import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegCommentDots } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import styles from "./chatbot.module.scss";
import { useAppContext } from "../../context/AppContext";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";

const API_URL = "https://23b0-42-113-16-185.ngrok-free.app";

const ChatBox = () => {
  const { isAuthenticated } = useAppContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          {
            role: "assistant",
            content: "Hello! I'm Tira's virtual assistant. How can I help you today?",
          },
        ]);
        setIsTyping(false);
      }, 1000);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (messages.length > 0 && !isInputFocused) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isTyping, isInputFocused]);

  const handleLinkClick = useCallback((productId) => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    navigate(`/product/${productId}`);
    setIsOpen(false);
  }, [isAuthenticated, navigate]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const updatedMessages = [
      {
        role: "system",
        content: "You are a virtual assistant of Tira Shop. Help customers find products or give advice.",
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
          content: "Please log in to view product details. You can log in [here](/auth).",
        };
      } else {
        const contentWithLinks = data.replace(
          /http:\/\/localhost:5173\/product\/(\d+)/g,
          (match, productId) => {
            return `[View Product ${productId}](#product-${productId})`;
          }
        );
        botMessage = { role: "assistant", content: contentWithLinks };
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
          <ChatMessages
            messages={messages}
            isTyping={isTyping}
            messagesEndRef={messagesEndRef}
            handleLinkClick={handleLinkClick}
          />
          <ChatInput
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            isTyping={isTyping}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
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