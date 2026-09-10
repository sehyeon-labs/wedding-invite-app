// src/components/sections/Location.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import data from "@/data/mock.json";
import styles from "./Location.module.scss";
import MapView from "@/components/map/MapView";
import { formatDay, formatTime } from "@/utils/Utils";

export default function Location() {
  const locationData = (data as any).location;
  const weddingDate = (data as any).weddingDate;

  const [hasAnimated, setHasAnimated] = useState(false);
  const [step, setStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const subTitleText = "> cat location.log";
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

  if (!locationData) return null;

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={`${styles.container} ${hasAnimated ? styles.visible : ""}`}>
        
        <div className={styles.headerTag}>
          <span>{hasAnimated ? typedSubTitle : ""}</span>
          {hasAnimated && <span className={styles.cursor}>_</span>}
        </div>

        <div className={`${styles.contentWrapper} ${hasAnimated && step >= 3 ? styles.showContent : ""}`}>
          
          {/* 상단 일정 정보 블록 */}
          <div className={styles.infoTextGroup}>
            <div className={styles.infoRow}>
              <span className={styles.key}>date</span>
              <span className={styles.val}>: {formatDay(weddingDate)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.key}>time</span>
              <span className={styles.val}>: {formatTime(weddingDate)}</span>
            </div>
            {locationData.name && (
              <div className={styles.infoRow}>
                <span className={styles.key}>venue</span>
                <span className={styles.val}>: {locationData.name}</span>
              </div>
            )}
          </div>

          {/* 지도 뷰어 */}
          <MapView 
            locationName={locationData.name}
            address={locationData.address}
            lat={locationData.lat}
            lng={locationData.lng}
          />

          {/* 하단 대중교통 정보 블록 */}
          <div className={styles.transportWrapper}>
            <span className={styles.configHeader}>// TRANSIT_INFO</span>
            {locationData.transport && (
              <div className={styles.transportContent}>
                {locationData.transport.map((transit: string, index: number) => (
                  <div key={index} className={styles.transitItem}>
                    <span className={styles.bullet}>#</span> {transit}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}