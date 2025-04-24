import React from "react";
import styles from "./spinner.module.css";

export const Spinner = () => {
  return (
    <div className={styles["spinner-container"]}>
      <div className={styles.spinner}></div>
    </div>
  );
};
