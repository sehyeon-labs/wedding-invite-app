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
  const titleText = `node invite.js --groom="${groom.englishName}" --bride="${bride.englishName}" `;
  const [displayedTitle, setDisplayedTitle] = useState("");

  useEffect(() => {
    let index = 0;
    setDisplayedTitle("");
    const typingInterval = setInterval(() => {
      if (index <= titleText.length) {
        setDisplayedTitle(titleText.substring(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => setLoadingStep(1), 300);
      }
    }, 70);
    return () => clearInterval(typingInterval);
  }, [titleText]);

  useEffect(() => {
    if (loadingStep === 1) setTimeout(() => setLoadingStep(2), 400);
    if (loadingStep === 2) setTimeout(() => setLoadingStep(3), 400);
    if (loadingStep === 3) setTimeout(() => setLoadingStep(4), 400);
    if (loadingStep === 4) setTimeout(() => setLoadingStep(5), 400);
    if (loadingStep === 5) {
      setTimeout(() => setLoadingStep(6), 2000);
    }
  }, [loadingStep]);

  useEffect(() => {
    if (loadingStep < 6) {
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
      {loadingStep < 6 && (
        <div className={styles.terminalLoader}>
          <div className={styles.terminalBox}>
            <p className={styles.promptLine}>
              <span className={styles.greenText}>guest@wedding-pc</span>:<span className={styles.blueText}>~</span>$ ./load_invitation.sh
            </p>
            <p className={styles.typingText}>
              {displayedTitle}
              {loadingStep === 0 && <span className={styles.cursor}>_</span>}
            </p>

            {loadingStep >= 1 && (
              <p className={styles.subOutputText}>
                &gt; Loading {groom.englishName} & {bride.englishName}&apos;s Wedding...
              </p>
            )}
            
            {loadingStep >= 2 && (
              <div className={styles.logContainer}>
                {loadingStep >= 2 && <p className={styles.logText}>[INFO] Connecting to database...</p>}
                {loadingStep >= 3 && <p className={styles.logText}>[INFO] Rendering love components (100%)...</p>}
                {loadingStep >= 4 && <p className={styles.successLog}>[SUCCESS] Ready to invite you.</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 비 효과 */}
      {loadingStep >= 5 && (
        <div className={`${styles.globalRainContainer} ${loadingStep === 6 ? styles.fadeOutRain : ""}`}>
          <div className={styles.terminalRain}>
            <span>&lt;3</span><span>*</span><span>+</span><span>{`{}`}</span><span>♥︎</span>
            <span>0</span><span>#</span><span>@</span><span>!</span><span>^o^</span>
            <span>&lt;3</span><span>♥︎</span><span>++</span><span>[ ]</span><span>$</span>
            <span>&amp;</span><span>&gt;</span><span>;</span><span>♥︎</span><span>0</span>
          </div>
        </div>
      )}

      {/* 메인 화면 */}
      <div className={`${styles.mainContent} ${loadingStep === 6 ? styles.show : styles.hidden}`}>
        <div className={styles.bgImageWrapper}>
          <img 
            src="/images/sample.jpg" 
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