"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { getAssetPath } from "@/utils/path";
import { containerVariants, itemVariants, sectionViewport } from "@/utils/motion";
import SectionHeader from "@/components/common/sectionHeader/SectionHeader";
import styles from "./Gallery.module.scss";
import TerminalGallery from "@/components/developer/TerminalGallery/TerminalGallery";

interface GalleryProps {
  isTerminalMode: boolean;
}

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

/** 앨범 그리드 크기 패턴 (9장 주기로 반복): big=2x2, tall=1x2, wide=2x1, 빈 값=1x1 */
const GRID_SHAPES = ["big", "", "", "wide", "", "tall", "", "", "wide"];

/** 처음 보여줄 사진 수 (3줄이 빈틈없이 채워지는 개수) */
const INITIAL_COUNT = 5;

const THUMB_ITEM_WIDTH = 42;
const THUMB_ITEM_GAP = 6;
const THUMB_PITCH = THUMB_ITEM_WIDTH + THUMB_ITEM_GAP;

/** 웨딩 갤러리: 그리드 목록 + 슬라이드/썸네일 상세 모달 */
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

  // 선택 이미지가 바뀌면 썸네일 트랙을 해당 위치로 이동 (처음↔마지막 순환 시에는 즉시 이동)
  useEffect(() => {
    if (selectedIndex !== null && thumbnailTrackRef.current && !isScrubbing) {
      const container = thumbnailTrackRef.current;
      isNavigatingRef.current = true;

      if (scrollUnlockTimerRef.current) {
        clearTimeout(scrollUnlockTimerRef.current);
      }

      const isLooping =
        (lastIndexRef.current === galleryImages.length - 1 && selectedIndex === 0) ||
        (lastIndexRef.current === 0 && selectedIndex === galleryImages.length - 1);

      container.scrollTo({
        left: selectedIndex * THUMB_PITCH,
        behavior: isLooping ? "instant" : "smooth",
      });

      lastIndexRef.current = selectedIndex;

      scrollUnlockTimerRef.current = setTimeout(() => {
        isNavigatingRef.current = false;
      }, isLooping ? 100 : 360);
    }
  }, [selectedIndex, isScrubbing, galleryImages.length]);

  /** 하단 썸네일 트랙을 직접 스크롤(스크러빙)할 때 현재 이미지 인덱스 동기화 */
  const handleThumbnailScroll = () => {
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

  const displayedImages = isExpanded ? galleryImages : galleryImages.slice(0, INITIAL_COUNT);

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
          viewport={sectionViewport}
        >
          <SectionHeader tag="GALLERY" />

          <motion.div className={styles.albumGrid} variants={itemVariants}>
            {displayedImages.map((src, index) => (
              <div
                key={index}
                className={`${styles.imageCard} ${styles[GRID_SHAPES[index % GRID_SHAPES.length]] ?? ""}`}
                onClick={() => openImageModal(index)}
              >
                <img src={src} alt={`갤러리 사진 ${index + 1}`} loading="lazy" />
                <div className={styles.overlay} />
              </div>
            ))}
          </motion.div>

          {galleryImages.length > INITIAL_COUNT && (
            <motion.div className={styles.actionRow} variants={itemVariants}>
              <button
                type="button"
                className={styles.expandBtn}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <span>
                  {isExpanded
                    ? "사진 접기"
                    : `사진 더보기 (${galleryImages.length - INITIAL_COUNT}장 더)`}
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