import React from "react";
import styles from "./styles.module.css";
import type { InputProps } from "./types.ts";

const Input: React.FC<InputProps> = ({
  type = "text",
  name,
  value,
  onChange,
  label,
  error,
  placeholder = "",
}) => {
  return (
    <div className={styles.wrapper}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${styles.input} ${error ? styles.error : ""}`}
      />
      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  );
};

export default Input;
