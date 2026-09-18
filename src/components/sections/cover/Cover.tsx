// src/components/sections/Cover.tsx
"use client";

import { useState, useEffect, MutableRefObject } from "react";
import data from "@/data/mock.json";
import { formatWeddingDate } from "@/utils/Utils";
import styles from "./Cover.module.scss";
import { getAssetPath } from "@/utils/path";
import TerminalIntro from "@/components/sections/terminalIntro/TerminalIntro";

interface CoverProps {
  isTerminalMode: boolean;
  hasLoadedRef: MutableRefObject<boolean>; 
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function Cover({ isTerminalMode, hasLoadedRef, onLoadingChange }: CoverProps) {
  const { groom, bride, weddingDate, location } = data;
  const formattedDate = formatWeddingDate(weddingDate);

  const [isLoadingAnimation, setIsLoadingAnimation] = useState(false);

  useEffect(() => {
    if (isTerminalMode && !hasLoadedRef.current) {
      hasLoadedRef.current = true; 
      setIsLoadingAnimation(true);
      if (onLoadingChange) onLoadingChange(true);
    } else {
      setIsLoadingAnimation(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  }, [isTerminalMode, hasLoadedRef, onLoadingChange]);

  const handleIntroComplete = () => {
    setIsLoadingAnimation(false);
    if (onLoadingChange) onLoadingChange(false);
  };

  return (
    <section className={`${styles.coverSection} ${isTerminalMode ? styles.terminalBg : ""}`}>
      
      {/* 1. 최초 진입 시에만 나타나는 인트로 로딩 컴포넌트 */}
      {isTerminalMode && isLoadingAnimation && (
        <TerminalIntro onComplete={handleIntroComplete} />
      )}

      {/* 2. 일반 모드 화면 */}
      {!isTerminalMode && (
        <div className={styles.mainContent}>
          <div className={styles.headerArea}>
            <h1 className={styles.names}>
              {groom.englishName || groom.name} <span className={styles.heart}>/</span> {bride.englishName || bride.name}
            </h1>
          </div>

          <div className={styles.imageContainer}>
            <img 
              src={getAssetPath("/images/sample.jpg")} 
              alt="웨딩 대표 사진" 
              className={styles.bgImage}
            />

            <div className={styles.vertical}>
              <div className={styles.verticalDate}>
                <span>October 25, 2027</span>
              </div>
              <div className={styles.verticalTime}>
                <span>Sunday, PM 12:00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. 터미널 모드 완료 결과 대시보드 화면 */}
      {isTerminalMode && !isLoadingAnimation && (
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
                  <p className={styles.targetPair}>{groom.englishName} & {bride.englishName}</p>
                  <p className={styles.pathText}>~/wedding-invitation/main</p>
                </div>
              </div>
              
              <h1 className={styles.terminalNames}>{groom.englishName} & {bride.englishName}</h1>
              <p className={styles.terminalDate}>// {formattedDate}</p>
              <p className={styles.terminalLocation}>// {location.name}</p>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}