"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Gallery.module.scss";

const GALLERY_IMAGES = [
  "/images/tomato.jpeg",
  "/images/tomato.jpeg",
  "/images/tomato.jpeg",
  "/images/tomato.jpeg",
  "/images/tomato.jpeg",
  "/images/tomato.jpeg",
  "/images/tomato.jpeg",
  "/images/tomato.jpeg",
  "/images/tomato.jpeg",
  "/images/tomato.jpeg",
  "/images/tomato.jpeg",
  "/images/tomato.jpeg",
];

interface GalleryProps {
  isTerminalMode: boolean;
}

export default function Gallery({ isTerminalMode }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false); // 더보기 펼침 상태
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  
  const thumbnailTrackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // 스크롤 진입 감지
  useEffect(() => {
    setHasAnimated(false);
    const currentRef = sectionRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(currentRef);

    const rect = currentRef.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom >= 0) {
      setHasAnimated(true);
      observer.disconnect();
    }

    return () => observer.disconnect();
  }, [isTerminalMode]);

  // 모달 썸네일 자동 포커스
  useEffect(() => {
    if (selectedIndex !== null && thumbnailTrackRef.current) {
      const selectedThumb = thumbnailTrackRef.current.children[selectedIndex] as HTMLElement;
      if (selectedThumb) {
        selectedThumb.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [selectedIndex]);

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

  // 모달 내 스와이프 제스처
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  // 기본 2줄(3열 기준 총 6장)만 보여주기, 펼치면 전체
  const displayedImages = isExpanded ? GALLERY_IMAGES : GALLERY_IMAGES.slice(0, 6);

  return (
    <section ref={sectionRef} className={styles.gallerySection}>
      {!isTerminalMode && (
        <div className={`${styles.normalContainer} ${hasAnimated ? styles.visible : ""}`}>
          
          <div className={styles.headerTag}>GALLERY</div>
          <h2 className={styles.mainTitle}>우리의 순간</h2>

          {/* 앨범형 그리드 레이아웃 */}
          <div className={styles.albumGrid}>
            {displayedImages.map((src, index) => (
              <div 
                key={index} 
                className={styles.imageCard}
                onClick={() => setSelectedIndex(index)}
              >
                <img src={src} alt={`웨딩 갤러리 사진 ${index + 1}`} loading="lazy" />
                <div className={styles.overlay}>
                  <span className={styles.zoomIcon}>zoom</span>
                </div>
              </div>
            ))}
          </div>

          {/* 더보기 버튼 (사진이 6장 이상일 때만 표시) */}
          {GALLERY_IMAGES.length > 6 && (
            <div className={styles.actionRow}>
              <button 
                className={styles.expandBtn}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "접기 ∧" : `더보기 (${GALLERY_IMAGES.length - 6}장 더) ∨`}
              </button>
            </div>
          )}

        </div>
      )}

      {isTerminalMode && (
        <div className={styles.terminalContainer}>
          <span className={styles.todo}>// TODO: 개발자 모드는 추후 필요할 때 구현</span>
        </div>
      )}

      {/* 이미지 확대 모달 */}
      {selectedIndex !== null && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedIndex(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalInner}>
              <button className={styles.closeBtn} onClick={() => setSelectedIndex(null)}>
                ✕
              </button>

              <button className={`${styles.slideBtn} ${styles.prevBtn}`} onClick={handlePrev}>
                &lt;
              </button>
              
              <div 
                className={styles.imageContainer}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img src={GALLERY_IMAGES[selectedIndex]} alt="확대된 웨딩 사진" />
                <span className={styles.imageCounter}>
                  {selectedIndex + 1} / {GALLERY_IMAGES.length}
                </span>
              </div>

              <button className={`${styles.slideBtn} ${styles.nextBtn}`} onClick={handleNext}>
                &gt;
              </button>
            </div>

            <div ref={thumbnailTrackRef} className={styles.thumbnailDock}>
              {GALLERY_IMAGES.map((src, index) => (
                <div
                  key={index}
                  className={`${styles.thumbItem} ${selectedIndex === index ? styles.activeThumb : ""}`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <img src={src} alt={`썸네일 ${index + 1}`} />
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </section>
  );
}