// src/components/sections/Prayer.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import data from "@/data/mock.json";
import styles from "./Prayer.module.scss";

interface PrayerItem {
  id: number;
  title: string;
  content: string;
}

export default function Prayer() {
  const prayers: PrayerItem[] = (data as any).prayers || [];

  const [hasAnimated, setHasAnimated] = useState(false);
  const [step, setStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const subTitleText = "> cat prayers.txt";
  const [typedSubTitle, setTypedSubTitle] = useState("");

  // 💡 Mac 창 열림/닫힘 상태 관리
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          setStep(1);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    if (step === 1) {
      let i = 0;
      const timer = setInterval(() => {
        if (i <= subTitleText.length) {
          setTypedSubTitle(subTitleText.slice(0, i));
          i++;
        } else {
          clearInterval(timer);
          setStep(2);
          
          setTimeout(() => {
            setStep(3);
          }, 600);
        }
      }, 90);
      return () => clearInterval(timer);
    }
  }, [hasAnimated, step, subTitleText]);

  if (!prayers || prayers.length === 0) return null;

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={`${styles.container} ${hasAnimated ? styles.visible : ""}`}>
        
        {/* 💡 다른 섹션들과 똑같은 타이핑 애니메이션 적용된 headerTag */}
        <div className={styles.headerTag}>
          <span>{hasAnimated ? typedSubTitle : ""}</span>
          {hasAnimated && <span className={styles.cursor}>_</span>}
        </div>

        <div className={`${styles.contentWrapper} ${hasAnimated && step >= 3 ? styles.showContent : ""}`}>
          <h2 className={styles.mainTitle}>우리의 기도제목</h2>

          <p className={styles.subDescription}>
            한 가정을 이루어 믿음의 길을 걸어갈 수 있도록<br />
            따뜻한 기도로 함께해 주세요.
          </p>

          {isOpen ? (
            <div className={styles.terminalBlock}>
              <div className={styles.blockHeader}>
                <div className={styles.dots}>
                  <button className={styles.dotRed} onClick={() => setIsOpen(false)} title="창 닫기" />
                  <button className={styles.dotYellow} onClick={() => setIsOpen(false)} title="창 닫기"  />
                  <button className={styles.dotGreen} onClick={() => setIsOpen(false)} title="창 닫기"  />
                </div>
                <span className={styles.fileName}>prayers.txt</span>
              </div>

              <div className={styles.prayerList}>
                {prayers.map((item, index) => {
                  const uniqueKey = `${item.id}-${index}`;
                  return (
                    <div key={uniqueKey} className={styles.prayerItem}>
                      <span className={styles.number}>0{index + 1}.</span>
                      <p className={styles.content}>{item.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <button className={styles.reopenBtn} onClick={() => setIsOpen(true)}>
              <span>[+] prayers.txt 파일 열기</span>
            </button>
          )}
        </div>

      </div>
    </section>
  );
}