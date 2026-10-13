"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./BackgroundMusic.module.scss";

export default function BackgroundMusic() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      <audio ref={audioRef} src={audioUrl} loop preload="auto" />
      <button
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