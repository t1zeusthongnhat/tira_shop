import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegCommentDots } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { FiX } from "react-icons/fi";
import styles from "./chatbot.module.scss";
import { useAppContext } from "../../context/AppContext";

const API_URL = "https://9d58-42-113-16-185.ngrok-free.app";

const ChatBox = () => {
  const { isAuthenticated } = useAppContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Lấy userId từ localStorage, mặc định là "guest" nếu không có
  const userId = localStorage.getItem("userId") || "guest";

  // Hàm tải lịch sử tin nhắn từ localStorage
  const loadMessages = () => {
    const savedMessages = localStorage.getItem(`chatMessages_${userId}`);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Error parsing saved messages:", error);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  };

  // Tải lịch sử tin nhắn khi component mount hoặc userId thay đổi
  useEffect(() => {
    loadMessages();
  }, [userId]);

  // Reset messages khi logout (isAuthenticated thay đổi thành false)
  useEffect(() => {
    if (!isAuthenticated && userId === "guest") {
      // Nếu không còn xác thực và ở trạng thái guest, reset messages
      setMessages([]);
      localStorage.removeItem("chatMessages_guest");
    }
  }, [isAuthenticated, userId]);

  // Lưu lịch sử tin nhắn vào localStorage mỗi khi messages thay đổi
  useEffect(() => {
    if (messages.length > 0) {
      const limitedMessages = messages.slice(-100); // Lưu tối đa 100 tin nhắn cuối
      localStorage.setItem(`chatMessages_${userId}`, JSON.stringify(limitedMessages));
    }
  }, [messages, userId]);

  // Khởi tạo tin nhắn chào mừng chỉ khi người dùng mở chatbot và chưa có tin nhắn
  useEffect(() => {
    if (isOpen && messages.length === 0 && isAuthenticated) {
      // Chỉ tạo tin nhắn chào mừng nếu đã đăng nhập
      setIsTyping(true);
      setTimeout(() => {
        const welcomeMessage = {
          role: "assistant",
          content: "Hello! I'm Tira's virtual assistant. How can I help you today?",
        };
        setMessages([welcomeMessage]);
        setIsTyping(false);
      }, 1000);
    }
  }, [isOpen, messages.length, isAuthenticated]);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Tập trung vào ô input khi chatbot mở
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      let botMessage;

      if (input.toLowerCase().includes("xem sản phẩm") || input.toLowerCase().includes("view products")) {
        if (!isAuthenticated) {
          botMessage = {
            role: "assistant",
            content: "Please log in to view product details. You can log in here.",
          };
        } else {
          const products = [
            { id: 1, name: "Product 1", image: "https://via.placeholder.com/240x240?text=Product+1" },
            { id: 2, name: "Product 2", image: "https://via.placeholder.com/240x240?text=Product+2" },
          ];
          botMessage = {
            role: "assistant",
            content: "Here are some products:",
            products: products,
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
      console.error("API Error:", error.message);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, something went wrong. Please try again later!",
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