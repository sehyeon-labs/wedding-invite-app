"use client";

import { useState, useEffect, useRef } from "react";
import data from "@/data/mock.json";
import styles from "./Reception.module.scss";
import MapView from "@/components/map/MapView";
import { formatDay, formatTime } from "@/utils/Utils";

interface ReceptionProps {
  isTerminalMode: boolean;
  onCopyToast?: () => void;
}

export default function Reception({ isTerminalMode, onCopyToast }: ReceptionProps) {
  const receptionData = (data as any).reception;

  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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
      { threshold: 0.3 }
    );

    observer.observe(currentRef);

    const rect = currentRef.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom >= 0) {
      setHasAnimated(true);
      observer.disconnect();
    }

    return () => observer.disconnect();
  }, [isTerminalMode]);

  if (!receptionData) return null;

  return (
    <section ref={sectionRef} className={styles.section}>
      {!isTerminalMode && (
        <div className={`${styles.container} ${hasAnimated ? styles.visible : ""}`}>
          
          {/* 상단 태그 */}
          <div className={styles.headerTag}>RECEPTION</div>
          <h2 className={styles.mainTitle}>피로연 안내</h2>

          <div className={styles.contentWrapper}>
            
            {/* 상세 안내 문구 */}
            {receptionData.description && (
              <p className={styles.subDescription}>
                {receptionData.description}
              </p>
            )}

            {/* 날짜, 시간, 장소 안내 블록 */}
            <div className={styles.infoTextGroup}>
              {receptionData.date && (
                <div className={styles.infoRow}>
                  <span className={styles.key}>일시</span>
                  <span className={styles.val}>{formatDay(receptionData.date)} {formatTime(receptionData.date)}</span>
                </div>
              )}
              {receptionData.locationName && (
                <div className={styles.infoRow}>
                  <span className={styles.key}>장소</span>
                  <span className={styles.val}>{receptionData.locationName}</span>
                </div>
              )}
              {receptionData.address && (
                <div className={styles.infoRow}>
                  <span className={styles.key}>주소</span>
                  <span className={styles.val}>{receptionData.address}</span>
                </div>
              )}
            </div>

            {/* MapView 컴포넌트 장착 */}
            <div className={styles.mapContainer}>
              <MapView 
                locationName={receptionData.locationName}
                address={receptionData.address}
                lat={receptionData.lat}
                lng={receptionData.lng}
                onCopySuccess={onCopyToast}
              />
            </div>

          </div>

        </div>
      )}

      {/* 개발자 모드 비워두기 */}
      {isTerminalMode && (
        <div className={styles.terminalContainer}>
          <span className={styles.todo}>// TODO: 개발자 모드는 추후 필요할 때 구현</span>
        </div>
      )}
    </section>
  );
}