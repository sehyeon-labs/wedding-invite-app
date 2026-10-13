"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./BackgroundMusic.module.scss";

export default function BackgroundMusic() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [showLabelPeek, setShowLabelPeek] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const peekTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 라벨을 잠깐 보여줬다가 스르륵 닫는 함수
  const triggerLabelPeek = useCallback((duration = 1200) => {
    if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
    setShowLabelPeek(true);
    peekTimerRef.current = setTimeout(() => {
      setShowLabelPeek(false);
    }, duration);
  }, []);

  useEffect(() => {
    async function fetchAudioFile() {
      try {
        const storageRef = supabase.storage.from("photos");
        const { data, error } = await storageRef.list("audio", {
          limit: 1,
          sortBy: { column: "name", order: "asc" },
        });

        if (error) throw error;

        if (data && data.length > 0) {
          const validFile = data.find((file) => file.name !== ".emptyFolderPlaceholder");
          if (validFile) {
            const { data: publicUrlData } = storageRef.getPublicUrl(`audio/${validFile.name}`);
            if (publicUrlData?.publicUrl) {
              setAudioUrl(publicUrlData.publicUrl);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch background music from Supabase:", error);
      }
    }

    fetchAudioFile();
  }, []);

  // 커버 벗어날 때 최초 1회 펼침 안내
  useEffect(() => {
    const coverElement = document.querySelector("section");
    if (!coverElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const shouldShow = !entry.isIntersecting;
        setIsVisible(shouldShow);

        if (shouldShow) {
          triggerLabelPeek(1500);
        } else {
          setShowLabelPeek(false);
          if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
        }
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(coverElement);

    return () => {
      observer.disconnect();
      if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
    };
  }, [triggerLabelPeek]);

  // 클릭 시 재생/정지 토글 및 텍스트 픽 모션 실행
  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      triggerLabelPeek(1200);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          triggerLabelPeek(1200);
        })
        .catch((err) => {
          console.error("오디오 재생 실패:", err);
        });
    }
  };

  if (!audioUrl) return null;

  return (
    <div className={`${styles.musicContainer} ${isVisible ? styles.visible : ""}`}>
      <audio ref={audioRef} src={audioUrl} loop preload="auto" />
      <button
        className={`${styles.musicBtn} ${isPlaying ? styles.playing : ""} ${
          showLabelPeek ? styles.peek : ""
        }`}
        onClick={togglePlay}
        aria-label="배경 음악 재생/정지"
      >
        <div className={styles.design9}>
          <div className={styles.radarArc} />
        </div>
        <span className={styles.label}>
          {isPlaying ? "BGM ON" : "BGM OFF"}
        </span>
      </button>
    </div>
  );
}