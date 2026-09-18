// src/components/sections/TerminalIntro.tsx
"use client";

import { useState, useEffect } from "react";
import styles from "./TerminalIntro.module.scss";

interface TerminalIntroProps {
  onComplete: () => void;
}

export default function TerminalIntro({ onComplete }: TerminalIntroProps) {
  const [loadingStep, setLoadingStep] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [logTimes, setLogTimes] = useState({
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
      t2: format(new Date(base.getTime() + 400)),
      t3: format(new Date(base.getTime() + 900)),
      t4: format(new Date(base.getTime() + 1400)),
      t5: format(new Date(base.getTime() + 2000)),
    });

    const t1 = setTimeout(() => setLoadingStep(1), 300);
    const t2 = setTimeout(() => setLoadingStep(2), 700);
    const t3 = setTimeout(() => setLoadingStep(3), 1200);
    const t4 = setTimeout(() => setLoadingStep(4), 1700);
    const t5 = setTimeout(() => setLoadingStep(5), 2400);
    const t6 = setTimeout(() => {
      onComplete(); // 로딩 완료 콜백 호출
    }, 3200);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearTimeout(t4); clearTimeout(t5); clearTimeout(t6);
    };
  }, [onComplete]);

  return (
    <div className={styles.terminalLoader}>
      <div className={styles.globalRainContainer}>
        <div className={styles.terminalRain}>
          <span>&lt;3</span><span>*</span><span>+</span><span>{`{}`}</span><span>♥︎</span>
          <span>0</span><span>#</span><span>@</span><span>!</span><span>^o^</span>
          <span>&lt;3</span><span>♥︎</span><span>++</span><span>[ ]</span><span>$</span>
          <span>&amp;</span><span>&gt;</span><span>;</span><span>♥︎</span><span>0</span>
        </div>
      </div>

      <div className={styles.terminalBox}>
        <div className={styles.logRow}>
          <span className={styles.promptSymbol}>$</span>
          <span className={styles.cyanText}> wedding-cli init --guest</span>
        </div>
        {loadingStep >= 1 && (
          <div className={styles.logRow}>
            <span className={styles.timeLabel}>{isMounted ? logTimes.t2 : "13:20:35"}</span>
            <span className={styles.blueText}>ℹ Establishing secure connection...</span>
          </div>
        )}
        {loadingStep >= 2 && (
          <div className={styles.logRow}>
            <span className={styles.timeLabel}>{isMounted ? logTimes.t3 : "13:20:39"}</span>
            <span className={styles.infoText}>⟡ Allocating love & memories modules...</span>
          </div>
        )}
        {loadingStep >= 3 && (
          <div className={styles.logRow}>
            <span className={styles.timeLabel}>{isMounted ? logTimes.t4 : "13:20:42"}</span>
            <span className={styles.infoText}>⟡ Compiling forever together package...</span>
          </div>
        )}
        {loadingStep >= 4 && (
          <div className={styles.logRow}>
            <span className={styles.timeLabel}>{isMounted ? logTimes.t5 : "13:20:45"}</span>
            <span className={styles.successLog}>✔ Ready. Launching interface...</span>
          </div>
        )}
      </div>
    </div>
  );
}