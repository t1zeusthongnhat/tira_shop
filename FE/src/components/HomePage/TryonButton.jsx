import React from "react";
import styles from "./TryOnButton.module.scss";

const TryOnButton = ({ onClick }) => {
  return (
    <button className={styles.tryOnButton} onClick={onClick}>
      <span className={styles.icon}>👚</span>
    </button>
  );
};

export default TryOnButton;
