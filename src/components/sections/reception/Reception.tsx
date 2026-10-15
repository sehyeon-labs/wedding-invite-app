"use client";

import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./Reception.module.scss";
import MapView from "@/components/map/MapView";
import { formatDay, formatTime } from "@/utils/format";
import TerminalReception from "@/components/developer/TerminalReception/TerminalReception";

interface ReceptionProps {
  isTerminalMode: boolean;
  onCopyToast?: () => void;
}

interface ReceptionData {
  date?: string;
  locationName?: string;
  address?: string;
  lat?: number | null;
  lng?: number | null;
  mealType?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Reception({ isTerminalMode, onCopyToast }: ReceptionProps) {
  const [receptionData, setReceptionData] = useState<ReceptionData | null>(null);

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
            locationName: data.reception_location_name || "",
            address: data.reception_address || "",
            lat: data.reception_lat,
            lng: data.reception_lng,
            mealType: data.reception_meal_type,
          });
        }
      } catch (error) {
        console.error("피로연 데이터 조회 실패:", error);
      }
    }

    fetchReceptionData();
  }, []);

  if (!receptionData && !isTerminalMode) return null;

  return (
    <section className={styles.section}>
      {isTerminalMode ? (
        <TerminalReception />
      ) : (
        receptionData && (
          <motion.div
            className={styles.container}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              margin: "0px 0px -80px 0px",
              amount: 0.2,
            }}
          >
            <motion.div className={styles.headerTag} variants={itemVariants}>
              RECEPTION
            </motion.div>

            <motion.h2 className={styles.mainTitle} variants={itemVariants}>
              피로연 안내
            </motion.h2>

            <div className={styles.contentWrapper}>
              <motion.p className={styles.subDescription} variants={itemVariants}>
               소중한 분들을 모시고 감사의 마음을 전하고자<br />
               작은 피로연 자리를 준비했습니다.<br />
               함께 자리해 주시어 기쁨을 나누어 주시면 감사하겠습니다.
              </motion.p>

              {/* 피로연 정보 카드 */}
              <motion.div className={styles.infoCard} variants={itemVariants}>
                {receptionData.date && (
                  <div className={styles.infoRow}>
                    <span className={styles.key}>일시</span>
                    <span className={styles.val}>
                      {formatDay(receptionData.date)} {formatTime(receptionData.date)}
                    </span>
                  </div>
                )}
                {receptionData.locationName && (
                  <div className={styles.infoRow}>
                    <span className={styles.key}>장소</span>
                    <span className={styles.valHighlight}>{receptionData.locationName}</span>
                  </div>
                )}
                {receptionData.address && (
                  <div className={styles.infoRow}>
                    <span className={styles.key}>주소</span>
                    <span className={styles.val}>{receptionData.address}</span>
                  </div>
                )}
                <div className={styles.infoRow}>
                  <span className={styles.key}>식사</span>
                  <span className={styles.val}>
                    {receptionData.mealType || "정성스러운 식사가 준비되어 있습니다."}
                  </span>
                </div>
              </motion.div>

              {/* 지도 래퍼 */}
              <motion.div className={styles.mapContainer} variants={itemVariants}>
                <MapView
                  locationName={receptionData.locationName || "피로연 장소"}
                  address={receptionData.address || ""}
                  lat={receptionData.lat}
                  lng={receptionData.lng}
                  onCopySuccess={onCopyToast}
                />
              </motion.div>
            </div>
          </motion.div>
        )
      )}
    </section>
  );
}