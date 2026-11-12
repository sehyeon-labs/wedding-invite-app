"use client";

import { useEffect, useSyncExternalStore, ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Modal.module.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** center: 화면 중앙 모달 / bottom: 하단 바텀시트 */
  placement?: "center" | "bottom";
  size?: "md" | "sm";
  /** 등장 애니메이션 시간(초). 기본 0.32 */
  duration?: number;
  children: ReactNode;
}

/** 공통 모달 (연락하기 모달과 동일한 스타일, 포탈 + 애니메이션 + ESC 닫기 + 배경 스크롤 잠금) */
export default function Modal({ isOpen, onClose, title, placement = "center", size = "md", duration = 0.32, children }: ModalProps) {
  // SSR에서는 false, 클라이언트에서는 true (포탈 대상 document.body 사용 가능 여부)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;
  const isBottom = placement === "bottom";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`${styles.overlay} ${isBottom ? styles.bottom : ""}`}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: Math.max(0.2, duration) }}
        >
          <motion.div
            className={`${styles.panel} ${size === "sm" ? styles.small : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            initial={isBottom ? { opacity: 0, y: "100%" } : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={isBottom ? { opacity: 0, y: "100%" } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className={styles.header}>
              <h3 className={styles.title}>{title}</h3>
              <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="닫기">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
