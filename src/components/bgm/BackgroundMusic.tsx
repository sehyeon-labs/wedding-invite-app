"use client";

import { useState, useRef, useEffect } from "react";
import { getFirstStorageFileUrl } from "@/lib/supabaseHelpers";
import styles from "./BackgroundMusic.module.scss";

/** 사용자 제스처로 인정될 수 있는 이벤트들 (브라우저별 차이를 고려해 폭넓게 감지) */
const GESTURE_EVENTS = ["pointerdown", "pointerup", "mousedown", "touchstart", "touchend", "click", "keydown", "wheel", "scroll"] as const;

/** 배경음악 플레이어: 진입 즉시 재생을 시도하고, 브라우저가 막으면 첫 사용자 동작에 재생 */
export default function BackgroundMusic() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 음원 파일 URL 조회
  useEffect(() => {
    getFirstStorageFileUrl("audio")
      .then(setAudioUrl)
      .catch((error) => console.error("음원 파일 조회 실패:", error));
  }, []);

  // 자동 재생 시도 + 차단 시 첫 제스처에서 재생
  useEffect(() => {
    const audio = audioRef.current;
    if (!audioUrl || !audio) return;

    let started = false;

    const cleanup = () => GESTURE_EVENTS.forEach((evt) => window.removeEventListener(evt, tryPlay));

    const tryPlay = () => {
      if (started) return;
      audio
        .play()
        .then(() => {
          started = true;
          setIsPlaying(true);
          cleanup();
        })
        .catch(() => {
          // 아직 재생 권한이 없으면 다음 제스처/로드 완료 시 재시도
        });
    };

    tryPlay();
    GESTURE_EVENTS.forEach((evt) => window.addEventListener(evt, tryPlay, { passive: true }));
    audio.addEventListener("canplaythrough", tryPlay);

    return () => {
      cleanup();
      audio.removeEventListener("canplaythrough", tryPlay);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("오디오 재생 실패:", err));
    }
  };

  if (!audioUrl) return null;

  return (
    <div className={styles.musicContainer}>
      <audio ref={audioRef} src={audioUrl} loop preload="auto" playsInline />
      <button
        type="button"
        className={`${styles.musicBtn} ${isPlaying ? styles.playing : ""}`}
        onClick={togglePlay}
        aria-label="배경 음악 켜기/끄기"
      >
        <div className={styles.equalizer}>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
        </div>
      </button>
    </div>
  );
}