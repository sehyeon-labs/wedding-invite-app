"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getAssetPath } from "@/utils/path";
import { supabase } from "@/lib/supabase";
import styles from "./Gallery.module.scss";

interface GalleryProps {
  isTerminalMode: boolean;
}

/**
 * Supabase Storage(photos 버킷)에서 사진을 조회하여 렌더링하는 갤러리 컴포넌트
 */
export default function Gallery({ isTerminalMode }: GalleryProps) {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const thumbnailTrackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isAutoScrolling = useRef<boolean>(false);

  /** Supabase Storage의 'photos' 버킷에서 이미지 목록 조회 */
  useEffect(() => {
    async function fetchGalleryImages() {
      try {
        const { data, error } = await supabase.storage
          .from("photos")
          .list("gallery", { // 'gallery' 폴더 지정
            limit: 100,
            sortBy: { column: "created_at", order: "asc" },
          });

        if (error) throw error;

        if (data) {
          const imageUrls = data
            .filter((file) => file.name && file.name !== ".emptyFolderPlaceholder")
            .map((file) => {
              const { data: publicUrlData } = supabase.storage
                .from("photos")
                .getPublicUrl(`gallery/${file.name}`);
              return publicUrlData.publicUrl;
            });

          setGalleryImages(imageUrls);
        }
      } catch (error) {
        console.error("Failed to fetch gallery images from Supabase:", error);
      }
    }

    fetchGalleryImages();
  }, []);

  /** 메인 사진 변경 시, 해당 썸네일을 중앙으로 포커스 이동 */
  useEffect(() => {
    if (selectedIndex !== null && thumbnailTrackRef.current) {
      const selectedThumb = thumbnailTrackRef.current.children[selectedIndex] as HTMLElement;
      if (selectedThumb) {
        isAutoScrolling.current = true;
        selectedThumb.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
        setTimeout(() => {
          isAutoScrolling.current = false;
        }, 300);
      }
    }
  }, [selectedIndex]);

  /** 하단 썸네일 바를 스크롤했을 때, 화면 중앙에 위치한 썸네일을 찾아 메인 사진과 동기화 */
  const handleThumbnailScroll = () => {
    if (isAutoScrolling.current || !thumbnailTrackRef.current) return;
    const container = thumbnailTrackRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    const thumbItems = container.children;
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < thumbItems.length; i++) {
      const thumb = thumbItems[i] as HTMLElement;
      const thumbRect = thumb.getBoundingClientRect();
      const thumbCenter = thumbRect.left + thumbRect.width / 2;
      const distance = Math.abs(containerCenter - thumbCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    if (selectedIndex !== closestIndex) {
      setSelectedIndex(closestIndex);
    }
  };

  /** 이전 이미지 슬라이드 핸들러 */
  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === 0 ? galleryImages.length - 1 : selectedIndex - 1);
  };

  /** 다음 이미지 슬라이드 핸들러 */
  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === galleryImages.length - 1 ? 0 : selectedIndex + 1);
  };

  /** 모달 내 터치 시작 지점 기록 */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  /** 모달 내 터치 이동 지점 기록 */
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  /** 터치 종료 시 스와이프 거리 계산 후 슬라이드 전환 */
  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  const displayedImages = isExpanded ? galleryImages : galleryImages.slice(0, 6);

  return (
    <section className={styles.gallerySection}>
      {/* 일반 모드 */}
      {!isTerminalMode && (
        <motion.div 
          className={styles.normalContainer}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
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
                <div className={styles.overlay}></div>
              </div>
            ))}
          </div>

          {/* 더보기 버튼 (6장 초과 시에만 노출) */}
          {galleryImages.length > 6 && (
            <div className={styles.actionRow}>
              <button 
                className={styles.expandBtn}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "접기 ∧" : `더보기 (${galleryImages.length - 6}장 더) ∨`}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* 개발자 모드 */}
      {isTerminalMode && (
        <motion.div 
          className={styles.terminalContainer}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.todo}>// TODO: 개발자 모드는 추후 필요할 때 구현</span>
        </motion.div>
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
                <img 
                  src={getAssetPath("/icon/down_w.png")} 
                  alt="토글 아이콘" 
                  width={22} 
                  height={22} />
              </button>
              
              <div 
                className={styles.imageContainer}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img src={galleryImages[selectedIndex]} alt="확대된 웨딩 사진" />
                <span className={styles.imageCounter}>
                  {selectedIndex + 1} / {galleryImages.length}
                </span>
              </div>

              <button className={`${styles.slideBtn} ${styles.nextBtn}`} onClick={handleNext}>
                <img 
                  src={getAssetPath("/icon/down_w.png")} 
                  alt="토글 아이콘" 
                  width={22} 
                  height={22} />
              </button>
            </div>

            <div 
              ref={thumbnailTrackRef} 
              className={styles.thumbnailDock}
              onScroll={handleThumbnailScroll}
            >
              {galleryImages.map((src, index) => (
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