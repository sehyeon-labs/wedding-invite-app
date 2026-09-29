"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./Reception.module.scss";
import MapView from "@/components/map/MapView";
import { formatDay, formatTime } from "@/utils/format";

interface ReceptionProps {
  isTerminalMode: boolean;
  onCopyToast?: () => void;
}

/**
 * Supabase에서 피로연 일시, 장소, 식사 안내 및 지도 정보를 조회하여 렌더링하는 피로연 안내 컴포넌트
 */
export default function Reception({ isTerminalMode, onCopyToast }: ReceptionProps) {
  const [receptionData, setReceptionData] = useState<any>(null);

  useEffect(() => {
    async function fetchReceptionData() {
      try {
        const { data, error } = await supabase
          .from("weddings")
          .select("reception_date, reception_location_name, reception_address, reception_lat, reception_lng, reception_meal_type")
          .limit(1)
          .single();

        if (error) throw error;

        if (data && data.reception_date) {
          setReceptionData({
            date: data.reception_date,
            locationName: data.reception_location_name,
            address: data.reception_address,
            lat: data.reception_lat,
            lng: data.reception_lng,
            mealType: data.reception_meal_type,
          });
        }
      } catch (error) {
        console.error("Failed to fetch reception data from Supabase:", error);
      }
    }

    fetchReceptionData();
  }, []);

  if (!receptionData) return null;

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
          <div className={styles.headerTag}>RECEPTION</div>
          <h2 className={styles.mainTitle}>피로연 안내</h2>

          <div className={styles.contentWrapper}>
            
            {/* 제목 아래: 상자 형태 없는 감성적인 안내 텍스트 문구 */}
            <p className={styles.subDescription}>
              거리가 멀어 예식에 참석하시기 어려운 분들을 위해<br />
              따뜻한 마음을 담아 작은 식사 자리를 마련했습니다.<br />
            </p>

            {/* 일시, 장소, 주소 및 식사 안내가 포함된 정보 상자 */}
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
              {/* 정보 상자 내부의 식사 안내 */}
              <div className={styles.infoRow}>
                <span className={styles.key}>식사</span>
                <span className={styles.val}>
                  {receptionData.mealType ? receptionData.mealType : "정성스러운 식사가 준비되어 있습니다."}
                </span>
              </div>
            </div>

            {/* 지도 컴포넌트 */}
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