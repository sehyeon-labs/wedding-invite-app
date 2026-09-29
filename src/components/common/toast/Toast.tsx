import React from 'react';
import styles from './Toast.module.scss';

interface ToastProps {
  text: string;
  showToast: boolean;
}

export default function Toast({ text, showToast }: ToastProps) {
  return (
    <div className={`${styles.toast} ${showToast ? styles.show : ""}`}>
      {text}
    </div>
  );
}