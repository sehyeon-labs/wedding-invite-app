"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { getAssetPath } from "@/utils/path";
import { containerVariants, itemVariants, sectionViewport } from "@/utils/motion";
import SectionHeader from "@/components/common/sectionHeader/SectionHeader";
import TerminalGuestbook from "@/components/developer/TerminalGuestbook/TerminalGuestbook";
import {
  GuestbookFormModal,
  GuestbookDeleteModal,
  GuestbookDeleteMineModal,
  GuestbookFormValues,
  GuestbookMatch,
} from "./GuestbookModals";
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

type ModalMode = "write" | "delete" | "deleteMine" | null;

/** 스와이프로 인식할 최소 이동 거리(px) / 속도(px/s) */
const SWIPE_DISTANCE = 50;
const SWIPE_VELOCITY = 400;

/** 한 번에 불러올 최대 메시지 수 */
const MAX_MESSAGES = 200;

/** 메시지가 길어 "더보기"가 필요한지 대략 판단 (3줄 clamp 기준) */
const isLongMessage = (text: string) => text.length > 70 || text.split("\n").length > 3;

/** 축하 방명록 섹션: 메시지를 한 장씩 넘겨보기 + 작성/삭제(비밀번호 확인) */
export default function Guestbook({ isTerminalMode, onToast }: GuestbookProps) {
  const [messages, setMessages] = useState<GuestbookItem[]>([]);
  const [index, setIndex] = useState(0);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  /** 최신순 메시지 조회. resetIndex가 true면 첫 장으로 이동 */
  const fetchMessages = useCallback(
    (resetIndex = false) =>
      supabase
        .from("guestbook")
        .select("id, name, message, created_at")
        .order("created_at", { ascending: false })
        .limit(MAX_MESSAGES)
        .then(({ data, error }) => {
          if (error) return console.error("방명록 조회 실패:", error);
          const list = data ?? [];
          setMessages(list);
          setIndex((i) => (resetIndex ? 0 : Math.min(i, Math.max(list.length - 1, 0))));
          setIsExpanded(false);
        }),
    []
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const current = messages[index] ?? null;
  const [direction, setDirection] = useState(1);
  const goTo = (next: number) => {
    if (next < 0 || next >= messages.length) return;
    setDirection(next > index ? 1 : -1);
    setIndex(next);
    setIsExpanded(false);
  };

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
      await fetchMessages(true);
    } catch (error) {
      console.error("방명록 저장 실패:", error);
      onToast?.("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  /** 삭제 제출 */
  const handleDeleteSubmit = async (password: string) => {
    if (!current || !password) {
      onToast?.("비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("guestbook")
        .delete()
        .eq("id", current.id)
        .eq("password", password)
        .select("id");

      if (error) throw error;
      if (!data?.length) {
        onToast?.("비밀번호가 일치하지 않습니다.");
        return;
      }
      closeModal();
      await fetchMessages();
      onToast?.("메시지가 삭제되었습니다.");
    } catch (error) {
      console.error("방명록 삭제 실패:", error);
      onToast?.("삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  /** 내 메시지 찾기: 이름·비밀번호가 모두 일치하는 메시지 목록 */
  const handleFindMine = async (name: string, password: string): Promise<GuestbookMatch[]> => {
    if (!name || !password) {
      onToast?.("이름과 비밀번호를 입력해주세요.");
      return [];
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("guestbook")
        .select("id, message, created_at")
        .eq("name", name)
        .eq("password", password)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data?.length) onToast?.("일치하는 메시지가 없습니다. 이름과 비밀번호를 확인해주세요.");
      return data ?? [];
    } catch (error) {
      console.error("내 방명록 조회 실패:", error);
      onToast?.("조회에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  /** 내 메시지 1건 삭제 (id + 이름 + 비밀번호 모두 일치해야 삭제) */
  const handleDeleteMine = async (id: number, name: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("guestbook")
        .delete()
        .eq("id", id)
        .eq("name", name)
        .eq("password", password)
        .select("id");

      if (error) throw error;
      if (!data?.length) {
        onToast?.("삭제할 수 없습니다. 이미 삭제되었거나 정보가 일치하지 않습니다.");
        return false;
      }
      await fetchMessages();
      onToast?.("메시지가 삭제되었습니다.");
      return true;
    } catch (error) {
      console.error("내 방명록 삭제 실패:", error);
      onToast?.("삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return false;
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

          {current && (
            <motion.div className={styles.swipeArea} variants={itemVariants}>
            <motion.article
              key={current.id}
              className={styles.messageCard}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              drag={messages.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.35}
              onDragEnd={(_, info) => {
                if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) goTo(index + 1);
                else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) goTo(index - 1);
              }}
            >

              <p className={`${styles.content} ${isExpanded ? "" : styles.clamp}`}>{current.message}</p>

              {isLongMessage(current.message) && (
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
                  <span className={styles.name}>{current.name}</span>
                  <span className={styles.date}>
                    {new Date(current.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
                <div className={styles.actions}>
                  <button type="button" onClick={() => setModalMode("delete")}>
                    삭제
                  </button>
                </div>
              </footer>
            </motion.article>
              {index > 0 && (
                <span className={`${styles.edge} ${styles.edgeLeft}`} aria-hidden>
                  ‹
                </span>
              )}
              {index < messages.length - 1 && (
                <span className={`${styles.edge} ${styles.edgeRight}`} aria-hidden>
                  ›
                </span>
              )}
            </motion.div>
          )}

          <motion.button type="button" className={styles.writeBtn} variants={itemVariants} onClick={() => setModalMode("write")}>
            축하 메시지 남기기
          </motion.button>

          <motion.button type="button" className={styles.mineBtn} variants={itemVariants} onClick={() => setModalMode("deleteMine")}>
            내 메시지 삭제
          </motion.button>

          <GuestbookFormModal
            isOpen={modalMode === "write"}
            loading={loading}
            onClose={closeModal}
            onSubmit={handleFormSubmit}
          />
          <GuestbookDeleteModal isOpen={modalMode === "delete"} loading={loading} onClose={closeModal} onSubmit={handleDeleteSubmit} />
          <GuestbookDeleteMineModal
            isOpen={modalMode === "deleteMine"}
            loading={loading}
            onClose={closeModal}
            onFind={handleFindMine}
            onDelete={handleDeleteMine}
          />
        </motion.div>
      )}
    </section>
  );
}
