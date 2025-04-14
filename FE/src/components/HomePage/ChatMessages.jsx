import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./chatbot.module.scss";

// Define the component with a display name
const ChatMessages = memo(
  ({ messages, isTyping, messagesEndRef, handleLinkClick }) => {
    return (
      <div className={styles.chatMessages}>
        {messages.length === 0 ? (
          <p className={styles.placeholderText}>Starting a new conversation...</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={styles.messageRow}
              style={{
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                className={
                  msg.role === "user" ? styles.userMessage : styles.assistantMessage
                }
              >
                <ReactMarkdown
                  components={{
                    a: ({ href, children }) => {
                      if (href && href.startsWith("#product-")) {
                        const productId = href.replace("#product-", "");
                        return (
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleLinkClick(productId);
                            }}
                          >
                            {children}
                          </a>
                        );
                      }
                      return <a href={href}>{children}</a>;
                    },
                    p: ({ children }) => <span>{children}</span>,
                    img: ({ src, alt }) => (
                      <img src={src} alt={alt} loading="lazy" />
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
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
    );
  },
  // Custom comparison function for React.memo to prevent unnecessary renders
  (prevProps, nextProps) => {
    return (
      prevProps.messages === nextProps.messages &&
      prevProps.isTyping === nextProps.isTyping &&
      prevProps.handleLinkClick === nextProps.handleLinkClick
    );
  }
);

// Set the display name for better debugging
ChatMessages.displayName = "ChatMessages";

export default ChatMessages;