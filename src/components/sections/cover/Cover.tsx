"use client";

import { useState, useEffect, MutableRefObject } from "react";
import { motion } from "framer-motion";
import { formatCoverDate, formatCoverTime } from "@/utils/format";
import styles from "./Cover.module.scss";
import { supabase } from "@/lib/supabase";
import TerminalCover from "@/components/developer/TerminalCover/TerminalCover";

interface CoverProps {
  isTerminalMode: boolean;
  hasLoadedRef: MutableRefObject<boolean>;
  onLoadingChange?: (isLoading: boolean) => void;
}

export interface WeddingCoverInfo {
  groomName: string;
  groomEnglishName: string;
  brideName: string;
  brideEnglishName: string;
  weddingDate: string;
  locationName: string;
}

export default function Cover({ isTerminalMode, hasLoadedRef, onLoadingChange }: CoverProps) {
  const [weddingInfo, setWeddingInfo] = useState<WeddingCoverInfo | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCoverData() {
      try {
        const { data: weddingData, error: weddingError } = await supabase
          .from("weddings")
          .select("*")
          .limit(1)
          .single();

        if (weddingError) throw weddingError;

        const { data: familyData, error: familyError } = await supabase
          .from("wedding_family_members")
          .select("*")
          .eq("wedding_id", weddingData.id);

        if (familyError) throw familyError;

        const groom = familyData?.find((m) => m.role_type === "groom");
        const bride = familyData?.find((m) => m.role_type === "bride");

        setWeddingInfo({
          groomName: groom?.name || "신랑",
          groomEnglishName: groom?.english_name || groom?.name || "Jinho",
          brideName: bride?.name || "신부",
          brideEnglishName: bride?.english_name || bride?.name || "Naeun",
          weddingDate: weddingData.wedding_date,
          locationName: weddingData.location_name,
        });

        const storageRef = supabase.storage.from("photos");
        const { data: fileList, error: storageError } = await storageRef.list("main", {
          limit: 5,
          sortBy: { column: "name", order: "asc" },
        });

        if (!storageError && fileList && fileList.length > 0) {
          const validFiles = fileList.filter((file) => file.name !== ".emptyFolderPlaceholder");
          if (validFiles.length > 0) {
            const { data: publicUrlData } = storageRef.getPublicUrl(`main/${validFiles[0].name}`);
            if (publicUrlData?.publicUrl) {
              setCoverImageUrl(publicUrlData.publicUrl);
            }
          }
        }
      } catch (error) {
        console.error("커버 데이터 로드 실패:", error);
      }
    }

    fetchCoverData();
  }, []);

  const formattedCoverDate = weddingInfo ? formatCoverDate(weddingInfo.weddingDate) : "";
  const formattedCoverTime = weddingInfo ? formatCoverTime(weddingInfo.weddingDate) : "";

  return (
    <section className={styles.coverSection}>
      {isTerminalMode ? (
        <TerminalCover
          weddingInfo={weddingInfo}
          hasLoadedRef={hasLoadedRef}
          onLoadingChange={onLoadingChange}
        />
      ) : (
        weddingInfo && (
          <motion.div
            className={styles.mainContent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* 상단 신랑 & 신부 영문 이름 */}
            <motion.div
              className={styles.headerArea}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            >
              <h1 className={styles.names}>
                <span>{weddingInfo.groomEnglishName}</span>
                <span className={styles.heart}>♥</span>
                <span>{weddingInfo.brideEnglishName}</span>
              </h1>
            </motion.div>

            {/* 메인 레이아웃 행 */}
            <div className={styles.contentRow}>
              {/* 좌측 90도 회전 텍스트: Save the date! + 날짜 */}
              <div className={`${styles.sideColumn} ${styles.leftSide}`}>
                <motion.div
                  className={styles.verticalGroupLeft}
                  initial={{ opacity: 0, y: 20, rotate: -90 }}
                  animate={{ opacity: 0.85, y: 0, rotate: -90 }}
                  transition={{ duration: 0.8, delay: 0.65, ease: "easeOut" }}
                > 
                  <span className={styles.saveTheDate}>Save the date!</span>
                  <span className={styles.dateText}>{formattedCoverDate}</span>
                </motion.div>
              </div>

              {/* 중앙 대표 사진 */}
              <div className={styles.imageCenter}>
                {coverImageUrl ? (
                  <motion.img
                    src={coverImageUrl}
                    alt="웨딩 대표 사진"
                    className={styles.bgImage}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
                  />
                ) : (
                  <div className={styles.emptyPhotoBox}>
                    <span>대표 사진 준비 중</span>
                  </div>
                )}
              </div>

              {/* 우측 90도 회전 텍스트: 드로잉 선 + 시간 */}
              <div className={`${styles.sideColumn} ${styles.rightSide}`}>
                <motion.div
                  className={styles.verticalGroupRight}
                  initial={{ opacity: 0, y: -20, rotate: 90 }}
                  animate={{ opacity: 0.85, y: 0, rotate: 90 }}
                  transition={{ duration: 0.8, delay: 0.95, ease: "easeOut" }}
                >
                  <div className={styles.handLine} />
                  <span className={styles.timeText}>{formattedCoverTime}</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )
      )}
    </section>
  );
}