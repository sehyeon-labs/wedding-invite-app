"use client";

import { useState, useEffect, useRef } from "react";
import data from "@/data/mock.json";
import styles from "./Location.module.scss";
import MapView from "@/components/map/MapView";
import { formatDay, formatTime } from "@/utils/Utils";

interface LocationProps {
  isTerminalMode: boolean;
  onCopyToast?: () => void; // 💡 상위 페이지에서 내려주는 전역 토스트 함수
}

interface TransportItem {
  category: "subway" | "bus" | "parking" | string;
  line?: string;
  busType?: "blue" | "green" | "red" | "yellow" | string;
  text: string;
}

export default function Location({ isTerminalMode, onCopyToast }: LocationProps) {
  const locationData = (data as any).location;
  const weddingDate = (data as any).weddingDate;

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

  if (!locationData) return null;

  const rawTransport = locationData.transport || [];
  const subwayItems = rawTransport.filter((item: TransportItem) => item.category === "subway");
  const busItems = rawTransport.filter((item: TransportItem) => item.category === "bus");
  const parkingItems = rawTransport.filter((item: TransportItem) => item.category === "parking");
  const otherItems = rawTransport.filter((item: TransportItem) => !["subway", "bus", "parking"].includes(item.category));

  return (
    <section ref={sectionRef} className={styles.section}>
      {!isTerminalMode && (
        <div className={`${styles.container} ${hasAnimated ? styles.visible : ""}`}>
          
          <div className={styles.headerTag}>LOCATION</div>
          <h2 className={styles.mainTitle}>오시는 길</h2>

          <div className={styles.contentWrapper}>
            
            <div className={styles.infoTextGroup}>
              <div className={styles.infoRow}>
                <span className={styles.key}>일시</span>
                <span className={styles.val}>{formatDay(weddingDate)} {formatTime(weddingDate)}</span>
              </div>
              {locationData.name && (
                <div className={styles.infoRow}>
                  <span className={styles.key}>장소</span>
                  <span className={styles.val}>{locationData.name}</span>
                </div>
              )}
              {locationData.address && (
                <div className={styles.infoRow}>
                  <span className={styles.key}>주소</span>
                  <span className={styles.val}>{locationData.address}</span>
                </div>
              )}
            </div>

            <div className={styles.mapContainer}>
              <MapView 
                locationName={locationData.name}
                address={locationData.address}
                lat={locationData.lat}
                lng={locationData.lng}
                onCopySuccess={onCopyToast}
              />
            </div>

            {/* 대중교통 및 주차 안내 블록 */}
            {rawTransport.length > 0 && (
              <div className={styles.transportWrapper}>
                <span className={styles.configHeader}>교통안내</span>
                <div className={styles.transportContent}>
                  
                  {/* 지하철 안내 */}
                  {subwayItems.map((item: TransportItem, index: number) => (
                    <div key={`subway-${index}`} className={styles.transitItem}>
                      <span className={`${styles.badge} ${styles.subwayBadge}`}>{item.line || "지하철"}</span>
                      <span className={styles.transitText}>{item.text}</span>
                    </div>
                  ))}

                  {/* 버스 안내 */}
                  {busItems.length > 0 && (
                    <div className={styles.busGroupContainer}>
                      <div className={styles.busGroupHeader}>
                        <span className={`${styles.badge} ${styles.busGroupBadge}`}>버스</span>
                      </div>
                      <div className={styles.busList}>
                        {busItems.map((item: TransportItem, index: number) => (
                          <div key={`bus-${index}`} className={styles.busItemRow}>
                            <span 
                              className={`
                                ${styles.busDot} 
                                ${item.busType === "blue" ? styles.dotBlue : item.busType === "green" ? styles.dotGreen : styles.dotDefault}
                              `} 
                            />
                            <span className={styles.transitText}>{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 주차 안내 */}
                  {parkingItems.map((item: TransportItem, index: number) => (
                    <div key={`parking-${index}`} className={styles.transitItem}>
                      <span className={`${styles.badge} ${styles.parkingBadge}`}>주차</span>
                      <span className={styles.transitText}>{item.text}</span>
                    </div>
                  ))}

                  {/* 기타 항목들 */}
                  {otherItems.map((item: TransportItem, index: number) => (
                    <div key={`other-${index}`} className={styles.transitItem}>
                      <span className={styles.bullet}>·</span>
                      <span className={styles.transitText}>{item.text}</span>
                    </div>
                  ))}

                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {isTerminalMode && (
        <div className={styles.terminalContainer}>
          <span className={styles.todo}>// TODO: 개발자 모드는 추후 필요할 때 구현</span>
        </div>
      )}
    </section>
  );
}