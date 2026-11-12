"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchWedding } from "@/lib/supabaseHelpers";
import { formatDay, formatTime } from "@/utils/format";
import { containerVariants, itemVariants, sectionViewport } from "@/utils/motion";
import MapView from "@/components/map/MapView";
import SectionHeader from "@/components/common/sectionHeader/SectionHeader";
import styles from "./Location.module.scss";
import TerminalLocation from "@/components/developer/TerminalLocation/TerminalLocation";

interface LocationProps {
  isTerminalMode: boolean;
  onCopyToast?: () => void;
}

interface TransportItem {
  category: "subway" | "bus" | "other" | "parking" | string;
  line?: string;
  busType?: "blue" | "green" | "red" | "yellow" | string;
  text: string;
}

interface WeddingLocationData {
  name: string;
  address: string;
  detail_address?: string;
  naver_address?: string;
  kakao_address?: string;
  lat: number;
  lng: number;
  transport: TransportItem[];
}

interface LocationRow {
  wedding_date: string;
  location_name: string | null;
  location_address: string | null;
  location_detail_address: string | null;
  location_naver_address: string | null;
  location_kakao_address: string | null;
  location_lat: number;
  location_lng: number;
  transport: TransportItem[] | null;
}

/** 지하철 호선명에 맞는 컬러 스타일 클래스 반환 */
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

/** "2호선, 9호선" 형태의 문자열을 호선 배열로 분리 */
const splitSubwayLines = (lineStr?: string) => {
  if (!lineStr) return ["지하철"];
  return lineStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

/** 오시는 길: 예식 정보 · 지도 · 교통편 안내 섹션 */
export default function Location({ isTerminalMode, onCopyToast }: LocationProps) {
  const [locationData, setLocationData] = useState<WeddingLocationData | null>(null);
  const [weddingDate, setWeddingDate] = useState<string>("");

  useEffect(() => {
    fetchWedding<LocationRow>(
      "wedding_date, location_name, location_address, location_detail_address, location_lat, location_lng, location_naver_address, location_kakao_address, transport"
    )
      .then((data) => {
        if (!data) return;
        setWeddingDate(data.wedding_date);
        setLocationData({
          name: data.location_name || "",
          address: data.location_address || "",
          detail_address: data.location_detail_address || "",
          naver_address: data.location_naver_address || "",
          kakao_address: data.location_kakao_address || "",
          lat: data.location_lat,
          lng: data.location_lng,
          transport: data.transport || [],
        });
      })
      .catch((error) => console.error("오시는 길 데이터 조회 실패:", error));
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
            viewport={sectionViewport}
          >
            <SectionHeader tag="LOCATION" />

            <div className={styles.contentWrapper}>
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
                    <span className={styles.valHighlight}>{locationData.name} {locationData.detail_address}</span>
                  </div>
                )}
                {locationData.address && (
                  <div className={styles.infoRow}>
                    <span className={styles.key}>주소</span>
                    <span className={styles.val}>{locationData.address}</span>
                  </div>
                )}
              </motion.div>

              <motion.div className={styles.mapContainer} variants={itemVariants}>
                <MapView
                  locationName={locationData.name}
                  address={locationData.address}
                  naver_address={locationData.naver_address}
                  kakao_address={locationData.kakao_address}
                  lat={locationData.lat}
                  lng={locationData.lng}
                  onCopySuccess={onCopyToast}
                />
              </motion.div>

              {rawTransport.length > 0 && (
                <motion.div className={styles.transportCard} variants={itemVariants}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>교통 안내</span>
                  </div>

                  <div className={styles.transportList}>
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

                    {otherItems.length > 0 && (
                      <div className={styles.transportRow}>
                        <div className={styles.categoryLabel}>셔틀버스</div>
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