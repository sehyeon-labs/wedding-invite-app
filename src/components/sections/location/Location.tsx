"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./Location.module.scss";
import MapView from "@/components/map/MapView";
import { formatDay, formatTime } from "@/utils/format";

interface LocationProps {
  isTerminalMode: boolean;
  onCopyToast?: () => void;
}

interface TransportItem {
  category: "subway" | "bus" | "parking" | string;
  line?: string;
  busType?: "blue" | "green" | "red" | "yellow" | string;
  text: string;
}

/**
 * Supabase에서 예식장 위치 및 대중교통 정보를 조회하여 렌더링하는 오시는 길 컴포넌트
 */
export default function Location({ isTerminalMode, onCopyToast }: LocationProps) {
  const [locationData, setLocationData] = useState<any>(null);
  const [weddingDate, setWeddingDate] = useState<string>("");

  useEffect(() => {
    async function fetchLocationData() {
      try {
        const { data, error } = await supabase
          .from("weddings")
          .select("wedding_date, location_name, location_address, location_lat, location_lng, transport")
          .limit(1)
          .single();

        if (error) throw error;

        if (data) {
          setWeddingDate(data.wedding_date);
          setLocationData({
            name: data.location_name,
            address: data.location_address,
            lat: data.location_lat,
            lng: data.location_lng,
            transport: data.transport || [],
          });
        }
      } catch (error) {
        console.error("Failed to fetch location data from Supabase:", error);
      }
    }

    fetchLocationData();
  }, []);

  if (!locationData) return null;

  const rawTransport = locationData.transport || [];
  const subwayItems = rawTransport.filter((item: TransportItem) => item.category === "subway");
  const busItems = rawTransport.filter((item: TransportItem) => item.category === "bus");
  const parkingItems = rawTransport.filter((item: TransportItem) => item.category === "parking");
  const otherItems = rawTransport.filter((item: TransportItem) => !["subway", "bus", "parking"].includes(item.category));

  return (
    <section className={styles.section}>
      {!isTerminalMode && (
        <motion.div 
          className={styles.container}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
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

            {rawTransport.length > 0 && (
              <div className={styles.transportWrapper}>
                <span className={styles.configHeader}>교통안내</span>
                <div className={styles.transportContent}>
                  {subwayItems.map((item: TransportItem, index: number) => (
                    <div key={`subway-${index}`} className={styles.transitItem}>
                      <span className={`${styles.badge} ${styles.subwayBadge}`}>{item.line || "지하철"}</span>
                      <span className={styles.transitText}>{item.text}</span>
                    </div>
                  ))}

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

                  {parkingItems.map((item: TransportItem, index: number) => (
                    <div key={`parking-${index}`} className={styles.transitItem}>
                      <span className={`${styles.badge} ${styles.parkingBadge}`}>주차</span>
                      <span className={styles.transitText}>{item.text}</span>
                    </div>
                  ))}

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
        </motion.div>
      )}

      {isTerminalMode && (
        <motion.div 
          className={styles.terminalContainer}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.todo}>// TODO: 개발자 모드는 추후 필요할 때 구현</span>
        </motion.div>
      )}
    </section>
  );
}