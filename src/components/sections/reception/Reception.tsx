// src/components/sections/Reception.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import data from "@/data/mock.json";
import styles from "./Reception.module.scss";
import MapView from "@/components/map/MapView";

export default function Reception() {
  const receptionData = (data as any).reception;

  const [hasAnimated, setHasAnimated] = useState(false);
  const [step, setStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const subTitleText = "> cat reception.txt";
  const [typedSubTitle, setTypedSubTitle] = useState("");

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
          setTimeout(() => setStep(3), 600);
        }
      }, 90);
      return () => clearInterval(timer);
    }
  }, [hasAnimated, step, subTitleText]);

  if (!receptionData) return null;

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={`${styles.container} ${hasAnimated ? styles.visible : ""}`}>
        
        {/* 타이핑 헤더 태그 */}
        <div className={styles.headerTag}>
          <span>{hasAnimated ? typedSubTitle : ""}</span>
          {hasAnimated && <span className={styles.cursor}>_</span>}
        </div>

        <div className={`${styles.contentWrapper} ${hasAnimated && step >= 3 ? styles.showContent : ""}`}>
          <h2 className={styles.mainTitle}>피로연 안내</h2>

          {/* 상세 안내 문구 */}
          {receptionData.description && (
            <p className={styles.subDescription}>
              {receptionData.description}
            </p>
          )}

          {/* 날짜, 시간, 장소 안내 */}
          <div className={styles.infoTextGroup}>
            {receptionData.date && (
              <div className={styles.infoRow}>
                <span className={styles.key}>date</span>
                <span className={styles.val}>: {receptionData.date}</span>
              </div>
            )}
            {receptionData.time && (
              <div className={styles.infoRow}>
                <span className={styles.key}>time</span>
                <span className={styles.val}>: {receptionData.time}</span>
              </div>
            )}
            {receptionData.locationName && (
              <div className={styles.infoRow}>
                <span className={styles.key}>venue</span>
                <span className={styles.val}>: {receptionData.locationName}</span>
              </div>
            )}
          </div>

          {/* MapView 컴포넌트 장착 */}
          <MapView 
            locationName={receptionData.locationName}
            address={receptionData.address}
            lat={receptionData.lat}
            lng={receptionData.lng}
          />
        </div>

      </div>
    </section>
  );
}