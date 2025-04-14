import { useRef } from "react";
import styles from "./chatbot.module.scss";
import { IoMdSend } from "react-icons/io";

const ChatInput = ({ input, setInput, sendMessage, isTyping }) => {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
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
  );
};

export default ChatInput;