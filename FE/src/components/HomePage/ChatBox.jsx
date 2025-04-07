import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegCommentDots } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { FiX } from "react-icons/fi";
import styles from "./chatbot.module.scss";
import { useAppContext } from "../../context/AppContext";

const API_URL = "https://7c21-118-70-118-224.ngrok-free.app";

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
            content: "Hello! I'm Tira's virtual assistant. How can I help you today?",
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

      // Kiểm tra nếu người dùng yêu cầu xem sản phẩm
      if (input.toLowerCase().includes("xem sản phẩm") || input.toLowerCase().includes("view products")) {
        if (!isAuthenticated) {
          botMessage = {
            role: "assistant",
            content: "Please log in to view product details. You can log in here.",
          };
        } else {
          // Giả lập danh sách sản phẩm với hình ảnh (thay bằng dữ liệu từ API thực tế nếu có)
          const products = [
            { id: 1, name: "Product 1", image: "https://via.placeholder.com/240x240?text=Product+1" },
            { id: 2, name: "Product 2", image: "https://via.placeholder.com/240x240?text=Product+2" },
          ];
          botMessage = {
            role: "assistant",
            content: "Here are some products:",
            products: products, // Thêm danh sách sản phẩm với hình ảnh
          };
        }
      } else {
        botMessage = {
          role: "assistant",
          content: data.content || "Sorry, I didn't understand that.",
        };
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
              <p className={styles.placeholderText}>Hello! Type your message...</p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    className={
                      msg.role === "user" ? styles.userMessage : styles.assistantMessage
                    }
                  >
                    <span className={styles.messageText}>{msg.content}</span>
                    {/* Hiển thị hình ảnh sản phẩm nếu có */}
                    {msg.products && (
                      <div className={styles.productList}>
                        {msg.products.map((product) => (
                          <div key={product.id} className={styles.productItem}>
                            <img src={product.image} alt={product.name} />
                            <span>{product.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className={styles.messageRow} style={{ justifyContent: "flex-start" }}>
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