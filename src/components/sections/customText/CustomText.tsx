"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./CustomText.module.scss";

interface CustomTextProps {
  isTerminalMode: boolean;
  title?: string;
  content?: string;
}

export default function CustomText({ 
  isTerminalMode, 
  title, 
  content 
}: CustomTextProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasAnimated(false);
    const currentRef = sectionRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(currentRef);

    const rect = currentRef.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom >= 0) {
      setHasAnimated(true);
      observer.disconnect();
    }

    return () => observer.disconnect();
  }, [isTerminalMode]);

  return (
    <section className={styles.customTextSection}>
      {/* 일반 모드 */}
      {!isTerminalMode && (
        <div ref={sectionRef} className={`${styles.normalContainer} ${hasAnimated ? styles.visible : ""}`}>
          <div className={styles.textWrapper}>
            <span className={styles.quoteMark}>“</span>
            {title && <p className={styles.verseText}>{title}</p>}
            {content && <p className={styles.verseRef}>{content}</p>}
          </div>
        </div>
      )}

      {/* 개발자 모드 */}
      {isTerminalMode && (
        <div ref={sectionRef} className={`${styles.terminalContainer} ${hasAnimated ? styles.visible : ""}`}>
          <span className={styles.todo}>// TODO: 개발자 모드는 추후 필요할 때 구현</span>
        </div>
      )}
    </section>
  );
}