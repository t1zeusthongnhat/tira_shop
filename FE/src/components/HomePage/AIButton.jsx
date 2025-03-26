import { useState } from "react";
import styles from "./styles.module.scss";

const AIButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAI = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Nút Try-On */}
      <button className={styles.aiButton} onClick={toggleAI}></button>

      {/* Màn hình trắng hiển thị khi click vào Try-On */}
      {isOpen && <div className={styles.aiScreen}></div>}
    </>
  );
};

export default AIButton;
