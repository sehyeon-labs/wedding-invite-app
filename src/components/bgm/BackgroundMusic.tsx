"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./BackgroundMusic.module.scss";

export default function BackgroundMusic() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
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
        console.error("Failed to fetch background music from Supabase:", error);
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
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("오디오 재생 실패:", err);
      });
    }
  };

  if (!audioUrl) return null;

  return (
    <div className={styles.musicContainer}>
      <audio ref={audioRef} src={audioUrl} loop preload="auto" />
      <button 
        className={`${styles.musicBtn} ${isPlaying ? styles.playing : ""}`}
        onClick={togglePlay}
        aria-label="배경 음악 재생/정지"
      >
        {/* 9번 레이더 아크 아이콘 */}
        <div className={styles.design9}>
          <div className={styles.radarArc}></div>
        </div>

        {/* 호버 시에만 나타나는 텍스트 레이블 */}
        <span className={styles.label}>{isPlaying ? "BGM ON" : "BGM OFF"}</span>
      </button>
    </div>
  );
}