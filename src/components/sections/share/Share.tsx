"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./Share.module.scss";

interface ShareProps {
  isTerminalMode: boolean;
  onCopyToast?: () => void;
}

/**
 * Supabase에서 공유 링크 정보를 조회하여 미니멀한 텍스트와 버튼 중심으로 공유 기능을 제공하는 컴포넌트
 */
export default function Share({ isTerminalMode, onCopyToast }: ShareProps) {
  const [shareLink, setShareLink] = useState<string>("");

  /** Supabase에서 청첩장 공유 링크 데이터 조회 */
  useEffect(() => {
    async function fetchShareData() {
      try {
        const { data, error } = await supabase
          .from("weddings")
          .select("share_link")
          .limit(1)
          .single();

        if (error) throw error;
        if (data) {
          setShareLink(data.share_link || window.location.href);
        }
      } catch (error) {
        console.error("Failed to fetch share data from Supabase:", error);
        setShareLink(window.location.href);
      }
    }

    fetchShareData();
  }, []);

  /** 현재 페이지 또는 Supabase 링크 복사 핸들러 */
  const handleCopyLink = async () => {
    try {
      const targetUrl = shareLink || window.location.href;
      await navigator.clipboard.writeText(targetUrl);
      if (onCopyToast) onCopyToast();
    } catch (err) {
      alert("링크 복사에 실패했습니다.");
    }
  };

  const handleKakaoShare = () => {
    alert("카카오톡 공유 기능은 SDK 설정 후 사용 가능합니다.");
  };

  return (
    <section className={styles.section}>
      {!isTerminalMode && (
        <motion.div 
          className={styles.container}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.headerTag}>SHARE</div>
          <h2 className={styles.mainTitle}>청첩장 공유하기</h2>

          {/* 상자 없는 미니멀한 컨텐츠 영역 */}
          <div className={styles.contentWrapper}>
            <div className={styles.buttonGroup}>
              <button className={styles.kakaoBtn} onClick={handleKakaoShare}>
                카카오톡 공유하기
              </button>
              <button className={styles.linkBtn} onClick={handleCopyLink}>
                링크 복사하기
              </button>
            </div>
          </div>
        </motion.div>
      )}

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
    </section>
  );
}