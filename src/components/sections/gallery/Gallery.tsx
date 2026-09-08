// src/components/sections/Gallery.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Gallery.module.scss";

const GALLERY_IMAGES = [
  "/images/sample.jpg",
  "/images/tomato.jpeg",
  "/images/sample.jpg",
  "/images/tomato.jpeg",
  "/images/sample.jpg",
  "/images/tomato.jpeg",
  "/images/sample.jpg",
  "/images/tomato.jpeg",
  "/images/sample.jpg",
  "/images/tomato.jpeg",
  "/images/sample.jpg",
  "/images/tomato.jpeg",
];

export default function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // 타이핑 애니메이션 상태
  const [isVisible, setIsVisible] = useState(false);
  const [typedTitle, setTypedTitle] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  
  // 가로 스크롤 트랙을 제어하기 위한 Ref
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false); // 마우스 올렸을 때 멈춤 여부

  const headerText = `// PHOTO_GALLERY.log`;
  const subTitleText = `소중한 순간들`;

  const [typedSubTitle, setTypedSubTitle] = useState("");
  const [step, setStep] = useState(0);

  // 스크롤 진입 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          setStep(1);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  // 타이핑 효과
  useEffect(() => {
    if (!isVisible) return;

    if (step === 1) {
      let i = 0;
      const timer = setInterval(() => {
        if (i <= headerText.length) {
          setTypedTitle(headerText.slice(0, i));
          i++;
        } else {
          clearInterval(timer);
          setStep(2);
        }
      }, 70);
      return () => clearInterval(timer);
    }

    if (step === 2) {
      let i = 0;
      const timer = setInterval(() => {
        if (i <= subTitleText.length) {
          setTypedSubTitle(subTitleText.slice(0, i));
          i++;
        } else {
          clearInterval(timer);
          setStep(3);
        }
      }, 90);
      return () => clearInterval(timer);
    }
  }, [isVisible, step, headerText, subTitleText]);

  // 자동 가로 스크롤 (Auto-Scroll) 애니메이션 효과
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let animationFrameId: number;
    let scrollPos = track.scrollLeft;
    const speed = 0.3;

    const stepScroll = () => {
      if (!isPaused && selectedIndex === null) {
        scrollPos += speed;
        track.scrollLeft = scrollPos;
        
        // 끝까지 도달했을 때 맨 앞으로 자연스럽게 루프(순환)
        if (track.scrollLeft >= track.scrollWidth - track.clientWidth) {
          scrollPos = 0;
          track.scrollLeft = 0;
        }
      } else {
        // 멈춰있을 때 현재 스크롤 위치 동기화
        scrollPos = track.scrollLeft;
      }
      animationFrameId = requestAnimationFrame(stepScroll);
    };

    animationFrameId = requestAnimationFrame(stepScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, selectedIndex]);

  // 모달 슬라이드 이전/다음 이동 함수
  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === 0 ? GALLERY_IMAGES.length - 1 : selectedIndex - 1);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === GALLERY_IMAGES.length - 1 ? 0 : selectedIndex + 1);
  };

  return (
    <section ref={sectionRef} className={styles.gallerySection}>
      <div className={`${styles.container} ${isVisible ? styles.visible : ""}`}>
        
        {/* 타이핑되는 상단 태그 */}
        <div className={styles.headerTag}>
          <span>{typedTitle}</span>
          {step === 1 && <span className={styles.cursor}>_</span>}
        </div>

        {/* 타이핑되는 메인 타이틀 */}
        <h2 className={styles.mainTitle}>
          {typedSubTitle}
          {step === 2 && <span className={styles.cursor}>_</span>}
        </h2>

        {/* 가로로 자동 흘러가는 트랙 (마우스 올리면 멈춤) */}
        <div 
          ref={trackRef}
          className={styles.horizontalScrollTrack}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {GALLERY_IMAGES.map((src, index) => (
            <div 
              key={index} 
              className={styles.imageCard}
              onClick={() => setSelectedIndex(index)}
            >
              <img src={src} alt={`웨딩 갤러리 사진 ${index + 1}`} loading="lazy" />
              <div className={styles.overlay}>
                <span className={styles.zoomIcon}>[ + view ]</span>
              </div>
            </div>
          ))}
        </div>

        {/* 안내 문구와 함께 [처음부터 보기] 버튼 추가 */}
        <div className={styles.actionRow}>
          <p className={styles.guideText}>* 터치하여 멈추거나 스와이프 하세요</p>
          <button 
            className={styles.startViewBtn}
            onClick={() => setSelectedIndex(0)}
          >
            [ ▶ 처음부터 보기 <span className={styles.btnCursor}>_</span> ]
          </button>
        </div>

      </div>

      {/* 이미지 확대 슬라이드 모달 */}
      {selectedIndex !== null && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedIndex(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalInner}>
              <button className={styles.closeBtn} onClick={() => setSelectedIndex(null)}>
                [CLOSE X]
              </button>

              <button className={`${styles.slideBtn} ${styles.prevBtn}`} onClick={handlePrev}>
                &lt;
              </button>
              
              <div className={styles.imageContainer}>
                <img src={GALLERY_IMAGES[selectedIndex]} alt="확대된 웨딩 사진" />
                <span className={styles.imageCounter}>
                  {selectedIndex + 1} / {GALLERY_IMAGES.length}
                </span>
              </div>

              <button className={`${styles.slideBtn} ${styles.nextBtn}`} onClick={handleNext}>
                &gt;
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}