"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { getAssetPath } from "@/utils/path";
import { containerVariants, itemVariants, sectionViewport } from "@/utils/motion";
import SectionHeader from "@/components/common/sectionHeader/SectionHeader";
import TerminalGuestbook from "@/components/developer/TerminalGuestbook/TerminalGuestbook";
import { GuestbookFormModal, GuestbookDeleteModal, GuestbookFormValues } from "./GuestbookModals";
import styles from "./Guestbook.module.scss";

interface GuestbookItem {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

interface GuestbookProps {
  isTerminalMode: boolean;
  onToast?: (msg: string) => void;
}

type ModalMode = "write" | "delete" | null;

/** 메시지가 길어 "더보기"가 필요한지 대략 판단 (3줄 clamp 기준) */
const isLongMessage = (text: string) => text.length > 70 || text.split("\n").length > 3;

/** 축하 방명록 섹션: 최신 메시지 1건 표시 + 작성/삭제(비밀번호 확인) */
export default function Guestbook({ isTerminalMode, onToast }: GuestbookProps) {
  const [latest, setLatest] = useState<GuestbookItem | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  /** 가장 최근 메시지 1건 조회 */
  const fetchLatest = useCallback(
    () =>
      supabase
        .from("guestbook")
        .select("id, name, message, created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .then(({ data, error }) => {
          if (error) return console.error("방명록 조회 실패:", error);
          setLatest(data?.[0] ?? null);
          setIsExpanded(false);
        }),
    []
  );

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  const closeModal = () => setModalMode(null);

  /** 작성 제출 */
  const handleFormSubmit = async ({ name, message, password }: GuestbookFormValues) => {
    if (!name || !message || !password) {
      onToast?.("이름, 메시지, 비밀번호를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("guestbook").insert([{ name, message, password }]);
      if (error) throw error;
      onToast?.("따뜻한 축하 말씀이 등록되었습니다.");
      closeModal();
      await fetchLatest();
    } catch (error) {
      console.error("방명록 저장 실패:", error);
      onToast?.("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  /** 삭제 제출 */
  const handleDeleteSubmit = async (password: string) => {
    if (!latest || !password) {
      onToast?.("비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("guestbook")
        .delete()
        .eq("id", latest.id)
        .eq("password", password)
        .select("id");

      if (error) throw error;
      if (!data?.length) {
        onToast?.("비밀번호가 일치하지 않습니다.");
        return;
      }
      closeModal();
      await fetchLatest();
      onToast?.("메시지가 삭제되었습니다.");
    } catch (error) {
      console.error("방명록 삭제 실패:", error);
      onToast?.("삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.section}>
      {isTerminalMode ? (
        <TerminalGuestbook />
      ) : (
        <motion.div
          className={styles.container}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          <SectionHeader tag="GUESTBOOK" title="축하 방명록" />

          <motion.p className={styles.desc} variants={itemVariants}>
            두 사람의 새로운 시작을 축복해 주시는
            <br />
            소중한 마음을 한 줄의 글로 남겨주세요.
          </motion.p>

          {latest && (
            <motion.article className={styles.messageCard} variants={itemVariants}>

              <p className={`${styles.content} ${isExpanded ? "" : styles.clamp}`}>{latest.message}</p>

              {isLongMessage(latest.message) && (
                <button type="button" className={styles.moreBtn} onClick={() => setIsExpanded((v) => !v)}>
                  <span>{isExpanded ? "접기" : "더보기"}</span>
                  <img
                    src={getAssetPath("/icon/down.png")}
                    alt=""
                    width={10}
                    height={10}
                    className={`${styles.moreIcon} ${isExpanded ? styles.rotate : ""}`}
                  />
                </button>
              )}

              <footer className={styles.cardFooter}>
                <div className={styles.author}>
                  <span className={styles.name}>{latest.name}</span>
                  <span className={styles.date}>
                    {new Date(latest.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
                <div className={styles.actions}>
                  <button type="button" onClick={() => setModalMode("delete")}>
                    삭제
                  </button>
                </div>
              </footer>
            </motion.article>
          )}

          <motion.button type="button" className={styles.writeBtn} variants={itemVariants} onClick={() => setModalMode("write")}>
            축하 메시지 남기기
          </motion.button>

          <GuestbookFormModal
            isOpen={modalMode === "write"}
            loading={loading}
            onClose={closeModal}
            onSubmit={handleFormSubmit}
          />
          <GuestbookDeleteModal isOpen={modalMode === "delete"} loading={loading} onClose={closeModal} onSubmit={handleDeleteSubmit} />
        </motion.div>
      )}
    </section>
  );
}
