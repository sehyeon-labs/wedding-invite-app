// src/components/sections/Cover.tsx
"use client";

import { useState, useEffect } from "react";
import data from "@/data/mock.json";
import { formatWeddingDate } from "@/utils/Utils";
import styles from "./Cover.module.scss";

export default function Cover() {
  const { groom, bride, weddingDate } = data;
  const formattedDate = formatWeddingDate(weddingDate);

  const [loadingStep, setLoadingStep] = useState(0);

  const [isMounted, setIsMounted] = useState(false);
  const [logTimes, setLogTimes] = useState({
    t1: "13:20:32",
    t2: "13:20:35",
    t3: "13:20:39",
    t4: "13:20:42",
    t5: "13:20:45",
  });

  useEffect(() => {
    setIsMounted(true);
    const base = new Date();
    const format = (d: Date) => d.toTimeString().split(" ")[0];
    
    setLogTimes({
      t1: format(base),
      t2: format(new Date(base.getTime() + 400)),
      t3: format(new Date(base.getTime() + 900)),
      t4: format(new Date(base.getTime() + 1400)),
      t5: format(new Date(base.getTime() + 2000)),
    });
  }, []);

  // 💡 단계별로 로그 -> 클로드 박스 -> 성공 로그 -> 메인 전환 순서로 부드럽게 진행
  useEffect(() => {
    if (loadingStep === 1) {
      const t = setTimeout(() => setLoadingStep(2), 400); // SERVICE WAKING UP
      return () => clearTimeout(t);
    }
    if (loadingStep === 2) {
      const t = setTimeout(() => setLoadingStep(3), 500); // ALLOCATING LOVE
      return () => clearTimeout(t);
    }
    if (loadingStep === 3) {
      const t = setTimeout(() => setLoadingStep(4), 500); // LOADING FOREVER
      return () => clearTimeout(t);
    }
    if (loadingStep === 4) {
      const t = setTimeout(() => setLoadingStep(5), 700); // 💡 여기서 클로드 로그인 박스 등장!
      return () => clearTimeout(t);
    }
    if (loadingStep === 5) {
      const t = setTimeout(() => setLoadingStep(6), 800); // SUCCESS 로그 등장
      return () => clearTimeout(t);
    }
    if (loadingStep === 6) {
      const t = setTimeout(() => setLoadingStep(7), 2000); // 메인 화면으로 시네마틱 전환
      return () => clearTimeout(t);
    }
  }, [loadingStep]);

  useEffect(() => {
    // 최초 진입 시 0단계에서 1단계로 자동 트리거
    const initTimer = setTimeout(() => {
      if (loadingStep === 0) setLoadingStep(1);
    }, 300);

    return () => clearTimeout(initTimer);
  }, [loadingStep]);

  useEffect(() => {
    if (loadingStep < 7) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [loadingStep]);

  return (
    <section className={styles.coverSection}>
      
      {/* 터미널 로딩 화면 */}
      {loadingStep < 7 && (
        <div className={styles.terminalLoader}>
          <div className={styles.terminalBox}>
            
            {/* 1단계 로그 */}
            <div className={styles.logRow}>
              <span className={styles.timeLabel}>{isMounted ? logTimes.t1 : "13:20:32"}</span>
              <span className={styles.cyanText}>INCOMING HTTP REQUEST DETECTED ...</span>
            </div>

            {/* 2단계 로그 */}
            {loadingStep >= 1 && (
              <div className={styles.logRow}>
                <span className={styles.timeLabel}>{isMounted ? logTimes.t2 : "13:20:35"}</span>
                <span className={styles.blueText}>SERVICE WAKING UP ...</span>
              </div>
            )}

            {/* 3단계 로그 */}
            {loadingStep >= 2 && (
              <div className={styles.logRow}>
                <span className={styles.timeLabel}>{isMounted ? logTimes.t3 : "13:20:39"}</span>
                <span className={styles.infoText}>ALLOCATING LOVE & MEMORIES ...</span>
              </div>
            )}

            {/* 4단계 로그 */}
            {loadingStep >= 3 && (
              <div className={styles.logRow}>
                <span className={styles.timeLabel}>{isMounted ? logTimes.t4 : "13:20:42"}</span>
                <span className={styles.infoText}>LOADING FOREVER TOGETHER ...</span>
              </div>
            )}

            {/* 💡 5단계: 로그가 흘러간 뒤 로그인 완료처럼 툭 튀어나오는 클로드 박스 */}
            {loadingStep >= 4 && (
              <div className={styles.claudeBox}>
                <div className={styles.boxHeader}>
                  <span>Wedding CLI v1.0.0</span>
                </div>
                <div className={styles.boxBody}>
                  <p className={styles.welcomeText}>Welcome back, Guest!</p>
                  <pre className={styles.pixelArt}>
{`  /\\_/\\      ♥      /\\_/\\  
 ( o.o )  TOGETHER  ( o.o ) 
  > ^ <   FOREVER    > ^ <  `}
                  </pre>
                  <div className={styles.boxFooterInfo}>
                    <p>{groom.englishName} & {bride.englishName}</p>
                    <p className={styles.pathText}>~/wedding-invitation/main</p>
                  </div>
                </div>
              </div>
            )}

            {/* 6단계: 최종 성공 로그 */}
            {loadingStep >= 5 && (
              <div className={styles.logRow} style={{ animation: "fadeInLogs 0.3s ease-out forwards" }}>
                <span className={styles.timeLabel}>{isMounted ? logTimes.t5 : "13:20:45"}</span>
                <span className={styles.successLog}>[SUCCESS] READY TO INVITE YOU.</span>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 비 효과 (6단계 이상일 때 작동) */}
      {loadingStep >= 5 && (
        <div className={`${styles.globalRainContainer} ${loadingStep === 7 ? styles.fadeOutRain : ""}`}>
          <div className={styles.terminalRain}>
            <span>&lt;3</span><span>*</span><span>+</span><span>{`{}`}</span><span>♥︎</span>
            <span>0</span><span>#</span><span>@</span><span>!</span><span>^o^</span>
            <span>&lt;3</span><span>♥︎</span><span>++</span><span>[ ]</span><span>$</span>
            <span>&amp;</span><span>&gt;</span><span>;</span><span>♥︎</span><span>0</span>
          </div>
        </div>
      )}

      {/* 메인 화면 */}
      <div className={`${styles.mainContent} ${loadingStep >= 7 ? styles.show : styles.hidden}`}>
        <div className={styles.bgImageWrapper}>
          <img 
            src="/images/sample-cover.jpg" 
            alt="웨딩 대표 사진" 
            className={styles.bgImage}
          />
          <div className={styles.gradientOverlay} />
        </div>

        <div className={styles.headerArea}>
          <span className={styles.subTitle}>Wedding Invitation</span>
          <h2 className={styles.dateText}>{formattedDate}</h2>
        </div>

        <div className={styles.footerArea}>
          <h1 className={styles.names}>
            {groom.englishName} <span className={styles.ampersand}>&</span> {bride.englishName}
          </h1>
          <p className={styles.locationName}>{data.location.name}</p>
        </div>
      </div>
    </section>
  );
}