// src/app/page.tsx
"use client";

import { useEffect, useRef } from "react";
import Cover from "@/components/sections/cover/Cover";
import Dday from "@/components/sections/dday/Dday";
import Gallery from "@/components/sections/gallery/Gallery";
import styles from "./page.module.scss";

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isAnimating = false;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isAnimating) return;

      const currentScroll = container.scrollTop;
      const windowHeight = window.innerHeight;
      const currentIndex = Math.round(currentScroll / windowHeight);

      // 아래로 휠 / 위로 휠 판단
      if (e.deltaY > 0) {
        // 다음 세션으로
        if (currentIndex < 2) { // 총 3개 세션(0, 1, 2) 기준
          isAnimating = true;
          container.scrollTo({
            top: (currentIndex + 1) * windowHeight,
            behavior: "smooth",
          });
          setTimeout(() => { isAnimating = false; }, 800); // 애니메이션 시간 동안 락
        }
      } else {
        // 위로 휠
        if (currentIndex > 0) {
          isAnimating = true;
          container.scrollTo({
            top: (currentIndex - 1) * windowHeight,
            behavior: "smooth",
          });
          setTimeout(() => { isAnimating = false; }, 800);
        }
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <section className={styles.section}><Cover /></section>
      <section className={styles.section}><Dday /></section>
      <section className={styles.section}><Gallery /></section>
    </div>
  );
}