"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchWedding } from "@/lib/supabaseHelpers";
import { formatDay, formatTime } from "@/utils/format";
import { containerVariants, itemVariants, sectionViewport } from "@/utils/motion";
import MapView from "@/components/map/MapView";
import SectionHeader from "@/components/common/sectionHeader/SectionHeader";
import styles from "./Reception.module.scss";
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
}

/** 피로연 안내(일시·장소·지도) 섹션 */
export default function Reception({ isTerminalMode, onCopyToast }: ReceptionProps) {
  const [receptionData, setReceptionData] = useState<ReceptionData | null>(null);

  useEffect(() => {
    fetchWedding<{
      reception_date: string | null;
      reception_location_name: string | null;
      reception_address: string | null;
      reception_lat: number | null;
      reception_lng: number | null;
    }>("reception_date, reception_location_name, reception_address, reception_lat, reception_lng")
      .then((data) => {
        if (!data?.reception_date) return;
        setReceptionData({
          date: data.reception_date,
          locationName: data.reception_location_name || "",
          address: data.reception_address || "",
          lat: data.reception_lat,
          lng: data.reception_lng,
        });
      })
      .catch((error) => console.error("피로연 데이터 조회 실패:", error));
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
            viewport={sectionViewport}
          >
            <SectionHeader tag="RECEPTION" title="피로연 안내" />

            <div className={styles.contentWrapper}>
              <motion.p className={styles.subDescription} variants={itemVariants}>
                예식 전, 작은 식사 자리를 마련했습니다.<br />
                편안히 들러 따뜻한 축복을 나눠 주세요.
              </motion.p>

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
              </motion.div>

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