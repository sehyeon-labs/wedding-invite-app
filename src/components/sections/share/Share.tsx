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
  const [shareImage, setShareImage] = useState<string>("");

  useEffect(() => {
    async function fetchShareData() {
      try {
        const { data: weddingData, error: weddingError } = await supabase
          .from("weddings")
          .select("share_link")
          .limit(1)
          .single();

        if (weddingError) throw weddingError;
        if (weddingData) {
          setShareLink(weddingData.share_link || window.location.origin + window.location.pathname);
        }
      } catch (error) {
        console.error("Failed to fetch share link from Supabase:", error);
        setShareLink(window.location.origin + window.location.pathname);
      }
    }

    async function fetchFirstPhoto() {
      try {
        const { data: files, error: storageError } = await supabase.storage
          .from("photos")
          .list("main", {
            limit: 1,
            sortBy: { column: "name", order: "asc" },
          });

        if (storageError) throw storageError;

        if (files && files.length > 0) {
          const firstFileName = files[0].name;
          
          const { data: publicUrlData } = supabase.storage
            .from("photos")
            .getPublicUrl(`main/${firstFileName}`);

          if (publicUrlData) {
            setShareImage(publicUrlData.publicUrl);
          }
        }
      } catch (error) {
        console.error("Failed to fetch storage photo:", error);
      }
    }

    fetchShareData();
    fetchFirstPhoto();

    // 카카오 SDK 초기화 (전역 window.Kakao 활용)
    if (window.Kakao && !window.Kakao.isInitialized()) {
      const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
      if (kakaoKey) {
        window.Kakao.init(kakaoKey);
      }
    }
  }, []);

  const handleCopyLink = async () => {
    try {
      const targetUrl = shareLink || window.location.origin + window.location.pathname;
      await navigator.clipboard.writeText(targetUrl);
      if (onCopyToast) onCopyToast();
    } catch (err) {
      alert("링크 복사에 실패했습니다.");
    }
  };

  /** 카카오톡 공유하기 핸들러 */
  const handleKakaoShare = () => {
    // 공식 문서 기준: 등록된 웹 도메인과 일치하는 기본 주소 사용 (쿼리 및 불필요한 해시 제거)
    const baseUrl = shareLink || window.location.origin + window.location.pathname;
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;

    if (!window.Kakao) {
      alert("카카오 SDK가 아직 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    if (!window.Kakao.isInitialized() && kakaoKey) {
      window.Kakao.init(kakaoKey);
    }

    if (!window.Kakao.Share) {
      alert("카카오톡 공유 기능을 사용할 수 없습니다.");
      return;
    }

    try {
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: "준구와 세현이의 결혼식에 초대합니다",
          description: "모바일 청첩장에서 일정과 상세 내용을 확인해 보세요.",
          imageUrl: shareImage || "",
          link: {
            mobileWebUrl: baseUrl,
            webUrl: baseUrl,
          },
        },
        buttons: [
          {
            title: "청첩장 보기",
            link: {
              mobileWebUrl: baseUrl,
              webUrl: baseUrl,
            },
          },
        ],
      });
    } catch (err) {
      console.error("카카오 공유 에러:", err);
      alert("카카오톡 공유 중 오류가 발생했습니다.");
    }
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