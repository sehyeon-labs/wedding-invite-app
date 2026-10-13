"use client";

import { useState, useEffect, MutableRefObject } from "react";
import styles from "./TerminalCover.module.scss";
import TerminalIntro from "@/components/sections/terminalIntro/TerminalIntro";
import { formatWeddingDate } from "@/utils/format";
import type { WeddingCoverInfo } from "@/components/sections/cover/Cover";

interface TerminalCoverProps {
  weddingInfo: WeddingCoverInfo | null;
  hasLoadedRef: MutableRefObject<boolean>;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function TerminalCover({
  weddingInfo,
  hasLoadedRef,
  onLoadingChange,
}: TerminalCoverProps) {
  const [isLoadingAnimation, setIsLoadingAnimation] = useState(false);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      setIsLoadingAnimation(true);
      onLoadingChange?.(true);
    } else {
      setIsLoadingAnimation(false);
      onLoadingChange?.(false);
    }
  }, [hasLoadedRef, onLoadingChange]);

  const handleIntroComplete = () => {
    setIsLoadingAnimation(false);
    onLoadingChange?.(false);
  };

  const formattedDate = weddingInfo ? formatWeddingDate(weddingInfo.weddingDate) : "";

  if (isLoadingAnimation) {
    return <TerminalIntro onComplete={handleIntroComplete} />;
  }

  if (!weddingInfo) return null;

  return (
    <div className={styles.terminalContainer}>
      <div className={styles.rainBackground}>
        <span>&lt;3</span><span>*</span><span>+</span><span>{`{}`}</span><span>♥︎</span>
        <span>0</span><span>#</span><span>@</span><span>!</span><span>^o^</span>
      </div>

      <div className={styles.contentBox}>
        <div className={styles.cliStatusBar}>
          <span className={styles.cliDot} />
          <span className={styles.cliTitle}>wedding-cli — session active</span>
        </div>

        <div className={styles.cardBox}>
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
              <span className={styles.targetPair}>
                {weddingInfo.groomEnglishName} & {weddingInfo.brideEnglishName}
              </span>
              <span className={styles.pathText}>~/wedding-invitation/main</span>
            </div>
          </div>

          <div className={styles.infoMeta}>
            <h1 className={styles.names}>
              {weddingInfo.groomEnglishName} & {weddingInfo.brideEnglishName}
            </h1>
            <p className={styles.metaText}>// {formattedDate}</p>
            <p className={styles.metaText}>// {weddingInfo.locationName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}