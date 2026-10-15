"use client";

import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./Location.module.scss";
import MapView from "@/components/map/MapView";
import { formatDay, formatTime } from "@/utils/format";
import TerminalLocation from "@/components/developer/TerminalLocation/TerminalLocation";

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

interface WeddingLocationData {
  name: string;
  address: string;
  lat: number;
  lng: number;
  transport: TransportItem[];
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

// 지하철 호선별 소프트 컬러 스타일 매핑
const getSubwayThemeClass = (lineName: string) => {
  const clean = lineName.trim().replace(/\s+/g, "");
  if (clean.includes("1호선")) return styles.line1;
  if (clean.includes("2호선")) return styles.line2;
  if (clean.includes("3호선")) return styles.line3;
  if (clean.includes("4호선")) return styles.line4;
  if (clean.includes("5호선")) return styles.line5;
  if (clean.includes("6호선")) return styles.line6;
  if (clean.includes("7호선")) return styles.line7;
  if (clean.includes("8호선")) return styles.line8;
  if (clean.includes("9호선")) return styles.line9;
  if (clean.includes("수인분당")) return styles.lineBundang;
  if (clean.includes("신분당")) return styles.lineShinbundang;
  if (clean.includes("경의중앙")) return styles.lineGyeongui;
  if (clean.includes("공항")) return styles.lineAirport;
  return styles.lineDefault;
};

const splitSubwayLines = (lineStr?: string) => {
  if (!lineStr) return ["지하철"];
  return lineStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

export default function Location({ isTerminalMode, onCopyToast }: LocationProps) {
  const [locationData, setLocationData] = useState<WeddingLocationData | null>(null);
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
            name: data.location_name || "",
            address: data.location_address || "",
            lat: data.location_lat,
            lng: data.location_lng,
            transport: data.transport || [],
          });
        }
      } catch (error) {
        console.error("오시는 길 데이터 조회 실패:", error);
      }
    }

    fetchLocationData();
  }, []);

  if (!locationData && !isTerminalMode) return null;

  const rawTransport = locationData?.transport || [];
  const subwayItems = rawTransport.filter((item) => item.category === "subway");
  const busItems = rawTransport.filter((item) => item.category === "bus");
  const parkingItems = rawTransport.filter((item) => item.category === "parking");
  const otherItems = rawTransport.filter(
    (item) => !["subway", "bus", "parking"].includes(item.category)
  );

  return (
    <section className={styles.section}>
      {isTerminalMode ? (
        <TerminalLocation />
      ) : (
        locationData && (
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
              LOCATION
            </motion.div>

            <div className={styles.contentWrapper}>
              {/* 기본 안내 카드 */}
              <motion.div className={styles.infoCard} variants={itemVariants}>
                <div className={styles.infoRow}>
                  <span className={styles.key}>일시</span>
                  <span className={styles.val}>
                    {formatDay(weddingDate)} {formatTime(weddingDate)}
                  </span>
                </div>
                {locationData.name && (
                  <div className={styles.infoRow}>
                    <span className={styles.key}>장소</span>
                    <span className={styles.valHighlight}>{locationData.name}</span>
                  </div>
                )}
                {locationData.address && (
                  <div className={styles.infoRow}>
                    <span className={styles.key}>주소</span>
                    <span className={styles.val}>{locationData.address}</span>
                  </div>
                )}
              </motion.div>

              {/* 지도 */}
              <motion.div className={styles.mapContainer} variants={itemVariants}>
                <MapView
                  locationName={locationData.name}
                  address={locationData.address}
                  lat={locationData.lat}
                  lng={locationData.lng}
                  onCopySuccess={onCopyToast}
                />
              </motion.div>

              {/* 세련되게 정돈된 교통안내 카드 */}
              {rawTransport.length > 0 && (
                <motion.div className={styles.transportCard} variants={itemVariants}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>교통 안내</span>
                  </div>

                  <div className={styles.transportList}>
                    {/* 지하철 섹션 */}
                    {subwayItems.length > 0 && (
                      <div className={styles.transportRow}>
                        <div className={styles.categoryLabel}>지하철</div>
                        <div className={styles.categoryContent}>
                          {subwayItems.map((item, index) => {
                            const lines = splitSubwayLines(item.line);
                            return (
                              <div key={`subway-${index}`} className={styles.detailBlock}>
                                <div className={styles.badgeLineWrap}>
                                  {lines.map((ln, lIdx) => (
                                    <span
                                      key={lIdx}
                                      className={`${styles.subwayPill} ${getSubwayThemeClass(ln)}`}
                                    >
                                      {ln}
                                    </span>
                                  ))}
                                </div>
                                <p className={styles.descText}>{item.text}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 버스 섹션 */}
                    {busItems.length > 0 && (
                      <div className={styles.transportRow}>
                        <div className={styles.categoryLabel}>버스</div>
                        <div className={styles.categoryContent}>
                          <div className={styles.busWrap}>
                            {busItems.map((item, index) => (
                              <div key={`bus-${index}`} className={styles.busItem}>
                                <span
                                  className={`
                                    ${styles.busTypeDot} 
                                    ${
                                      item.busType === "blue"
                                        ? styles.dotBlue
                                        : item.busType === "green"
                                        ? styles.dotGreen
                                        : item.busType === "red"
                                        ? styles.dotRed
                                        : styles.dotDefault
                                    }
                                  `}
                                />
                                <span className={styles.descText}>{item.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 주차 안내 */}
                    {parkingItems.length > 0 && (
                      <div className={styles.transportRow}>
                        <div className={styles.categoryLabel}>주차</div>
                        <div className={styles.categoryContent}>
                          {parkingItems.map((item, index) => (
                            <p key={`parking-${index}`} className={styles.descText}>
                              {item.text}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 기타 안내 */}
                    {otherItems.length > 0 && (
                      <div className={styles.transportRow}>
                        <div className={styles.categoryLabel}>안내</div>
                        <div className={styles.categoryContent}>
                          {otherItems.map((item, index) => (
                            <p key={`other-${index}`} className={styles.descText}>
                              {item.text}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )
      )}
    </section>
  );
}