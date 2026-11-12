"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchWedding, getFirstStorageFileUrl } from "@/lib/supabaseHelpers";
import { copyToClipboard } from "@/utils/format";
import { containerVariants, itemVariants, sectionViewport } from "@/utils/motion";
import SectionHeader from "@/components/common/sectionHeader/SectionHeader";
import TerminalShare from "@/components/developer/TerminalShare/TerminalShare";
import styles from "./Share.module.scss";

interface ShareProps {
  isTerminalMode: boolean;
  onToast?: (msg: string) => void;
}

const currentUrl = () => window.location.origin + window.location.pathname;

/** 카카오 SDK 초기화 (이미 초기화된 경우 무시). 사용 가능하면 true */
function ensureKakao(): boolean {
  if (!window.Kakao) return false;
  const key = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
  if (!window.Kakao.isInitialized() && key) window.Kakao.init(key);
  return !!window.Kakao.Share;
}

/** 청첩장 공유 섹션 (카카오톡 공유 / 링크 복사) */
export default function Share({ isTerminalMode, onToast }: ShareProps) {
  const [shareLink, setShareLink] = useState("");
  const [shareImage, setShareImage] = useState("");

  useEffect(() => {
    fetchWedding<{ share_link: string | null }>("share_link")
      .then((data) => setShareLink(data?.share_link || currentUrl()))
      .catch((error) => {
        console.error("공유 링크 조회 실패:", error);
        setShareLink(currentUrl());
      });

    getFirstStorageFileUrl("main")
      .then((url) => url && setShareImage(url))
      .catch((error) => console.error("공유 이미지 조회 실패:", error));

    ensureKakao();
  }, []);

  const targetUrl = () => shareLink || currentUrl();

  const handleCopyLink = async () => {
    onToast?.((await copyToClipboard(targetUrl())) ? "주소가 복사되었습니다." : "링크 복사에 실패했습니다.");
  };

  const handleKakaoShare = () => {
    if (!ensureKakao()) {
      onToast?.("카카오톡 공유를 지금은 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const url = targetUrl();
    const link = { mobileWebUrl: url, webUrl: url };

    try {
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: "준구와 세현이의 결혼식에 초대합니다",
          description: "모바일 청첩장에서 일정과 상세 내용을 확인해 보세요.",
          imageUrl: shareImage,
          link,
        },
        buttons: [{ title: "청첩장 보기", link }],
      });
    } catch (error) {
      console.error("카카오 공유 에러:", error);
      onToast?.("카카오톡 공유 중 오류가 발생했습니다.");
    }
  };

  return (
    <section className={styles.section}>
      {isTerminalMode ? (
        <TerminalShare />
      ) : (
        <motion.div
          className={styles.container}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          <SectionHeader tag="SHARE" title="청첩장 공유하기" />

          <motion.p className={styles.desc} variants={itemVariants}>
            소중한 분들께 두 사람의 초대장을
            <br />
            전해주세요.
          </motion.p>

          <motion.div className={styles.buttonGroup} variants={itemVariants}>
            <button type="button" className={`${styles.shareBtn} ${styles.kakao}`} onClick={handleKakaoShare}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.87 5.33 4.69 6.75l-.95 3.5c-.08.3.26.54.52.37l4.15-2.75c.52.07 1.05.13 1.59.13 5.52 0 10-3.58 10-8S17.52 3 12 3z" />
              </svg>
              <span>카카오톡으로 공유</span>
            </button>
            <button type="button" className={`${styles.shareBtn} ${styles.link}`} onClick={handleCopyLink}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span>링크 복사하기</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
