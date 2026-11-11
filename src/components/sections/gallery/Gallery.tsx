"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { getAssetPath } from "@/utils/path";
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

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 320, damping: 32 },
      opacity: { duration: 0.2 },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 320, damping: 32 },
      opacity: { duration: 0.2 },
    },
  }),
};

const THUMB_ITEM_WIDTH = 42;
const THUMB_ITEM_GAP = 6;
const THUMB_PITCH = THUMB_ITEM_WIDTH + THUMB_ITEM_GAP;

export default function Gallery({ isTerminalMode }: GalleryProps) {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const thumbnailTrackRef = useRef<HTMLDivElement>(null);
  const isNavigatingRef = useRef<boolean>(false);
  const scrollUnlockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrubbingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastIndexRef = useRef<number>(0);

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

  // [수정 핵심] 상단 넘김 시 하단 썸네일 이동 로직
  useEffect(() => {
    if (selectedIndex !== null && thumbnailTrackRef.current && !isScrubbing) {
      const container = thumbnailTrackRef.current;
      isNavigatingRef.current = true;

      if (scrollUnlockTimerRef.current) {
        clearTimeout(scrollUnlockTimerRef.current);
      }

      // 마지막 ↔ 0번 순환 루프 점프일 때는 스무스 롤백 없이 'instant(즉시)'로 이동하여 중간 사진 침범 차단
      const isLooping =
        (lastIndexRef.current === galleryImages.length - 1 && selectedIndex === 0) ||
        (lastIndexRef.current === 0 && selectedIndex === galleryImages.length - 1);

      container.scrollTo({
        left: selectedIndex * THUMB_PITCH,
        behavior: isLooping ? "instant" : "smooth",
      });

      lastIndexRef.current = selectedIndex;

      // 스크롤이 끝날 때까지 onScroll 감지 확실히 차단
      scrollUnlockTimerRef.current = setTimeout(() => {
        isNavigatingRef.current = false;
      }, isLooping ? 100 : 360);
    }
  }, [selectedIndex, isScrubbing, galleryImages.length]);

  // 하단 썸네일 트랙 스크러빙 핸들러
  const handleThumbnailScroll = () => {
    // 자동 이동 중일 때는 onScroll 계산을 완전히 스킵하여 인덱스 간섭 원천 차단
    if (isNavigatingRef.current || !thumbnailTrackRef.current) return;

    const scrollLeft = thumbnailTrackRef.current.scrollLeft;
    const currentIndex = Math.max(
      0,
      Math.min(galleryImages.length - 1, Math.round(scrollLeft / THUMB_PITCH))
    );

    if (lastIndexRef.current !== currentIndex) {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(6);
        } catch (_) {}
      }

      setDirection(currentIndex > lastIndexRef.current ? 1 : -1);
      lastIndexRef.current = currentIndex;
      setSelectedIndex(currentIndex);
    }

    setIsScrubbing(true);
    if (scrubbingTimerRef.current) {
      clearTimeout(scrubbingTimerRef.current);
    }
    scrubbingTimerRef.current = setTimeout(() => {
      setIsScrubbing(false);
    }, 120);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (selectedIndex === null || galleryImages.length === 0) return;

    setIsScrubbing(false);
    isNavigatingRef.current = true;
    setDirection(-1);
    setSelectedIndex((prev) => (prev === 0 ? galleryImages.length - 1 : (prev ?? 0) - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (selectedIndex === null || galleryImages.length === 0) return;

    setIsScrubbing(false);
    isNavigatingRef.current = true;
    setDirection(1);
    setSelectedIndex((prev) => (prev === galleryImages.length - 1 ? 0 : (prev ?? 0) + 1));
  };

  const openImageModal = (index: number) => {
    setIsScrubbing(false);
    isNavigatingRef.current = true;
    setDirection(0);
    setSelectedIndex(index);
    lastIndexRef.current = index;
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

          <motion.div className={styles.albumGrid} variants={itemVariants}>
            {displayedImages.map((src, index) => (
              <div
                key={index}
                className={styles.imageCard}
                onClick={() => openImageModal(index)}
              >
                <img src={src} alt={`갤러리 사진 ${index + 1}`} loading="lazy" />
                <div className={styles.overlay} />
              </div>
            ))}
          </motion.div>

          {galleryImages.length > 9 && (
            <motion.div className={styles.actionRow} variants={itemVariants}>
              <button
                type="button"
                className={styles.expandBtn}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <span>
                  {isExpanded
                    ? "사진 접기"
                    : `사진 더보기 (${galleryImages.length - 9}장 더)`}
                </span>
                <img
                  src={getAssetPath("/icon/down.png")}
                  alt="토글 아이콘"
                  width={11}
                  height={11}
                  className={`${styles.toggleIconImg} ${isExpanded ? styles.rotate : ""}`}
                />
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
            transition={{ duration: 0.22 }}
            onClick={() => setSelectedIndex(null)}
          >
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
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
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                <div className={styles.mainImageContainer}>
                  <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                      key={selectedIndex}
                      custom={direction}
                      variants={isScrubbing ? undefined : slideVariants}
                      initial={isScrubbing ? false : "enter"}
                      animate={isScrubbing ? { opacity: 1, x: 0 } : "center"}
                      exit={isScrubbing ? { opacity: 0 } : "exit"}
                      transition={
                        isScrubbing
                          ? { duration: 0 }
                          : { x: { type: "spring", stiffness: 320, damping: 32 }, opacity: { duration: 0.2 } }
                      }
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.4}
                      onDragEnd={(e, { offset, velocity }) => {
                        const swipe = offset.x;
                        if (swipe < -40 || velocity.x < -400) {
                          handleNext();
                        } else if (swipe > 40 || velocity.x > 400) {
                          handlePrev();
                        }
                      }}
                      className={styles.slideItem}
                    >
                      <img
                        src={galleryImages[selectedIndex]}
                        alt={`확대 사진 ${selectedIndex + 1}`}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  className={`${styles.navBtn} ${styles.nextBtn}`}
                  onClick={handleNext}
                  aria-label="다음 사진"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              {/* 하단 썸네일 독 */}
              <div
                ref={thumbnailTrackRef}
                className={styles.thumbnailDock}
                onScroll={handleThumbnailScroll}
                onTouchStart={() => {
                  isNavigatingRef.current = false;
                }}
                onMouseDown={() => {
                  isNavigatingRef.current = false;
                }}
              >
                <div className={styles.dockSpacer} />

                {galleryImages.map((src, index) => (
                  <div
                    key={index}
                    className={`${styles.thumbItem} ${
                      selectedIndex === index ? styles.activeThumb : ""
                    }`}
                    onClick={() => {
                      if (selectedIndex !== index) {
                        setIsScrubbing(false);
                        isNavigatingRef.current = true;
                        setDirection(index > (selectedIndex ?? 0) ? 1 : -1);
                        setSelectedIndex(index);
                      }
                    }}
                  >
                    <img src={src} alt={`미니 썸네일 ${index + 1}`} />
                  </div>
                ))}

                <div className={styles.dockSpacer} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}