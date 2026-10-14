"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./Gallery.module.scss";
import TerminalGallery from "@/components/developer/TerminalGallery/TerminalGallery";

interface GalleryProps {
  isTerminalMode: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Gallery({ isTerminalMode }: GalleryProps) {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const thumbnailTrackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isAutoScrolling = useRef<boolean>(false);

  useEffect(() => {
    async function fetchGalleryImages() {
      try {
        const { data, error } = await supabase.storage
          .from("photos")
          .list("gallery", {
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
        console.error("갤러리 이미지 조회 실패:", error);
      }
    }

    fetchGalleryImages();
  }, []);

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

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === 0 ? galleryImages.length - 1 : selectedIndex - 1);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === galleryImages.length - 1 ? 0 : selectedIndex + 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  const displayedImages = isExpanded ? galleryImages : galleryImages.slice(0, 9);

  return (
    <section className={styles.gallerySection}>
      {isTerminalMode ? (
        <TerminalGallery />
      ) : (
        <motion.div
          className={styles.normalContainer}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            margin: "0px 0px -80px 0px",
            amount: 0.2,
          }}
        >
          <motion.div className={styles.headerTag} variants={itemVariants}>
            GALLERY
          </motion.div>

          {/* 3열 썸네일 그리드 */}
          <motion.div className={styles.albumGrid} variants={itemVariants}>
            {displayedImages.map((src, index) => (
              <div
                key={index}
                className={styles.imageCard}
                onClick={() => setSelectedIndex(index)}
              >
                <img src={src} alt={`갤러리 사진 ${index + 1}`} loading="lazy" />
                <div className={styles.overlay} />
              </div>
            ))}
          </motion.div>

          {/* 더보기 버튼 */}
          {galleryImages.length > 9 && (
            <motion.div className={styles.actionRow} variants={itemVariants}>
              <button
                type="button"
                className={styles.expandBtn}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded
                  ? "접기 ∧"
                  : `사진 더보기 (${galleryImages.length - 9}장 더) ∨`}
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* 이미지 상세 모달 */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedIndex(null)}
          >
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              {/* 상단 닫기 바 */}
              <div className={styles.modalTopBar}>
                <span className={styles.imageCounter}>
                  {selectedIndex + 1} / {galleryImages.length}
                </span>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setSelectedIndex(null)}
                  aria-label="닫기"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* 메인 이미지 스테이지 */}
              <div className={styles.stageArea}>
                <button
                  type="button"
                  className={`${styles.navBtn} ${styles.prevBtn}`}
                  onClick={handlePrev}
                  aria-label="이전 사진"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                <div
                  className={styles.mainImageContainer}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <motion.img
                    key={selectedIndex}
                    src={galleryImages[selectedIndex]}
                    alt={`확대 사진 ${selectedIndex + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                  />
                </div>

                <button
                  type="button"
                  className={`${styles.navBtn} ${styles.nextBtn}`}
                  onClick={handleNext}
                  aria-label="다음 사진"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              {/* 하단 썸네일 독 */}
              <div
                ref={thumbnailTrackRef}
                className={styles.thumbnailDock}
                onScroll={handleThumbnailScroll}
              >
                {galleryImages.map((src, index) => (
                  <div
                    key={index}
                    className={`${styles.thumbItem} ${
                      selectedIndex === index ? styles.activeThumb : ""
                    }`}
                    onClick={() => setSelectedIndex(index)}
                  >
                    <img src={src} alt={`미니 썸네일 ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}