"use client";

import { useState, useEffect, MutableRefObject } from "react";
import { motion } from "framer-motion";
import { formatWeddingDate, formatCoverDate, formatCoverTime } from "@/utils/format";
import styles from "./Cover.module.scss";
import { getAssetPath } from "@/utils/path";
import TerminalIntro from "@/components/sections/terminalIntro/TerminalIntro";
import { supabase } from "@/lib/supabase";

interface CoverProps {
  isTerminalMode: boolean;
  hasLoadedRef: MutableRefObject<boolean>; 
  onLoadingChange?: (isLoading: boolean) => void;
}

interface WeddingInfo {
  groomName: string;
  groomEnglishName: string;
  brideName: string;
  brideEnglishName: string;
  weddingDate: string;
  locationName: string;
}

/**
 * 웨딩 청첩장 커버 및 터미널 모드 컴포넌트
 */
export default function Cover({ isTerminalMode, hasLoadedRef, onLoadingChange }: CoverProps) {
  const [weddingInfo, setWeddingInfo] = useState<WeddingInfo | null>(null);
  const [isLoadingAnimation, setIsLoadingAnimation] = useState(false);

  /** Supabase에서 웨딩 및 혼주 정보 조회 */
  useEffect(() => {
    async function fetchWeddingData() {
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
          groomEnglishName: groom?.english_name || groom?.name || "Groom",
          brideName: bride?.name || "신부",
          brideEnglishName: bride?.english_name || bride?.name || "Bride",
          weddingDate: weddingData.wedding_date,
          locationName: weddingData.location_name,
        });
      } catch (error) {
        console.error("Failed to fetch wedding data from Supabase:", error);
      }
    }

    fetchWeddingData();
  }, []);

  /** 터미널 모드 진입 시 최초 1회 로딩 애니메이션 제어 */
  useEffect(() => {
    if (isTerminalMode && !hasLoadedRef.current) {
      hasLoadedRef.current = true; 
      setIsLoadingAnimation(true);
      onLoadingChange?.(true);
    } else {
      setIsLoadingAnimation(false);
      onLoadingChange?.(false);
    }
  }, [isTerminalMode, hasLoadedRef, onLoadingChange]);

  /** 터미널 인트로 애니메이션 완료 핸들러 */
  const handleIntroComplete = () => {
    setIsLoadingAnimation(false);
    onLoadingChange?.(false);
  };

  const formattedDate = weddingInfo ? formatWeddingDate(weddingInfo.weddingDate) : "";
  const formattedCoverDate = weddingInfo ? formatCoverDate(weddingInfo.weddingDate) : "";
  const formattedCoverTime = weddingInfo ? formatCoverTime(weddingInfo.weddingDate) : "";

  return (
    <section className={`${styles.coverSection} ${isTerminalMode ? styles.terminalBg : ""}`}>

      {/* 일반 모드 화면 */}
      {!isTerminalMode && weddingInfo && (
        <motion.div 
          className={styles.mainContent}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className={styles.headerArea}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <h1 className={styles.names}>
              {weddingInfo.groomEnglishName} 
              <motion.span 
                className={styles.heart}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                /
              </motion.span> 
              {weddingInfo.brideEnglishName}
            </h1>
          </motion.div>

          <div className={styles.imageContainer}>
            <motion.img 
              src={getAssetPath("/images/tomato.jpeg")} 
              alt="웨딩 대표 사진" 
              className={styles.bgImage}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            />

            <motion.div 
              className={styles.vertical}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <div className={styles.verticalDate}>
                <span>{formattedCoverDate}</span>
              </div>
              <div className={styles.verticalTime}>
                <span>{formattedCoverTime}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* 터미널 모드 인트로 애니메이션 */}
      {isTerminalMode && isLoadingAnimation && (
        <TerminalIntro onComplete={handleIntroComplete} />
      )}

      {/* 터미널 모드 완료 결과 대시보드 화면 */}
      {isTerminalMode && !isLoadingAnimation && weddingInfo && (
        <div className={styles.terminalResultScreen}>
          <div className={styles.globalRainContainer}>
            <div className={styles.terminalRain}>
              <span>&lt;3</span><span>*</span><span>+</span><span>{`{}`}</span><span>♥︎</span>
              <span>0</span><span>#</span><span>@</span><span>!</span><span>^o^</span>
              <span>&lt;3</span><span>♥︎</span><span>++</span><span>[ ]</span><span>$</span>
              <span>&amp;</span><span>&gt;</span><span>;</span><span>♥︎</span><span>0</span>
            </div>
          </div>
          
          <div className={styles.terminalContentBox}>
            <div className={styles.cliStatusBar}>
              <span className={styles.cliDot}></span>
              <span className={styles.cliTitle}>wedding-cli — session active</span>
            </div>
            
            <div className={styles.claudeBox}>
              <div className={styles.boxHeader}>
                <span>session://guest@wedding-env</span>
                <span className={styles.activeBadge}>CONNECTED</span>
              </div>
              <div className={styles.boxBody}>
                <p className={styles.welcomeText}>Welcome back, Guest!</p>
                <pre className={styles.pixelArt}>
{`  /\\_/\\      ♥      /\\_/\\  
 ( o.o )  TOGETHER  ( o.o ) 
  > ^ <   FOREVER    > ^ <  `}
                </pre>
                <div className={styles.boxFooterInfo}>
                  <p className={styles.targetPair}>{weddingInfo.groomEnglishName} & {weddingInfo.brideEnglishName}</p>
                  <p className={styles.pathText}>~/wedding-invitation/main</p>
                </div>
              </div>
              
              <h1 className={styles.terminalNames}>{weddingInfo.groomEnglishName} & {weddingInfo.brideEnglishName}</h1>
              <p className={styles.terminalDate}>// {formattedDate}</p>
              <p className={styles.terminalLocation}>// {weddingInfo.locationName}</p>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}