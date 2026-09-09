// src/components/common/QuickNav.tsx
"use client";

import styles from "./QuickNav.module.scss";

interface QuickNavProps {
  totalSections: number;
  activeIndex: number;
  isVisible: boolean;
  onSelect: (index: number) => void;
}

export default function QuickNav({ totalSections, activeIndex, isVisible, onSelect }: QuickNavProps) {
  return (
    <nav className={`${styles.quickNav} ${isVisible ? styles.show : ""}`}>
      {Array.from({ length: totalSections }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={`${styles.barButton} ${activeIndex === index ? styles.active : ""}`}
          aria-label={`Section ${index + 1}`}
        >
          <span className={styles.bar} />
        </button>
      ))}
    </nav>
  );
}