"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./BackgroundMusic.module.scss";

export default function BackgroundMusic() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 음원 파일 불러오기
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
        console.error("음원 파일 조회 실패:", error);
      }
    }

    fetchAudioFile();
  }, []);

  // 첫 화면 터치/클릭 감지하여 오디오 재생
  useEffect(() => {
    if (!audioUrl || !audioRef.current) return;

    const audio = audioRef.current;

    const startAudio = () => {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          removeListeners();
        })
        .catch(() => {
          // 브라우저가 아직 권한을 주지 않은 경우 대기
        });
    };

    const removeListeners = () => {
      // 스크롤 대신 브라우저가 유효한 제스처로 인정하는 터치/클릭 이벤트들
      window.removeEventListener("pointerdown", startAudio);
      window.removeEventListener("touchend", startAudio);
      window.removeEventListener("click", startAudio);
    };

    // 1. 자동 재생 즉시 시도 (PC 또는 자동재생 허용 브라우저)
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        // 2. 모바일 브라우저 차단 시: 화면 어디든 첫 터치/탭 발생 즉시 재생
        setIsPlaying(false);
        window.addEventListener("pointerdown", startAudio, { once: true });
        window.addEventListener("touchend", startAudio, { once: true });
        window.addEventListener("click", startAudio, { once: true });
      });

    return () => {
      removeListeners();
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