"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./Share.module.scss";

interface ShareProps {
  isTerminalMode: boolean;
  onCopyToast?: () => void;
}

export default function Share({ isTerminalMode, onCopyToast }: ShareProps) {
  const [shareLink, setShareLink] = useState<string>("");

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

  const handleCopyLink = async () => {
    try {
      const targetUrl = shareLink || window.location.href;
      await navigator.clipboard.writeText(targetUrl);
      if (onCopyToast) onCopyToast();
    } catch (err) {
      alert("링크 복사에 실패했습니다.");
    }
  };

  /** 카카오톡 링크 공유 (에러 없는 최신 공유 팝업 방식) */
  const handleKakaoShare = () => {
    const targetUrl = shareLink || window.location.href;
    
    // 올바른 카카오 공유 picker 엔드포인트 사용
    const kakaoShareUrl = `https://sharer.kakao.com/picker/link?url=${encodeURIComponent(targetUrl)}`;
    
    window.open(kakaoShareUrl, "kakaoShareWindow", "width=500,height=600");
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