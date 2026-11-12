"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { fetchWedding } from "@/lib/supabaseHelpers";
import { containerVariants, itemVariants, sectionViewport } from "@/utils/motion";
import SectionHeader from "@/components/common/sectionHeader/SectionHeader";
import TerminalNotice from "@/components/developer/TerminalNotice/TerminalNotice";
import styles from "./Notice.module.scss";

interface NoticeProps {
  isTerminalMode: boolean;
}

/** wedding_notices.type 값 → 탭 이름 (표시 순서 포함) */
const NOTICE_TABS = [
  { type: "bride_room", label: "신부대기실" },
  { type: "venue", label: "식장 이용" },
  { type: "flower", label: "화환" },
] as const;

type NoticeType = (typeof NOTICE_TABS)[number]["type"];
type NoticeGroups = Record<NoticeType, string[]>;

const emptyGroups = (): NoticeGroups => ({ bride_room: [], venue: [], flower: [] });

/** 문자열 / 문자열 배열 / {content|text} 객체 배열 등 다양한 저장 형태를 문자열 목록으로 정규화 */
function toTextList(value: unknown): string[] {
  const list = Array.isArray(value) ? value : typeof value === "string" ? value.split("\n\n") : [];
  return list
    .map((item) => (typeof item === "string" ? item : (item as { content?: string; text?: string })?.content ?? (item as { text?: string })?.text))
    .filter((text): text is string => typeof text === "string" && text.trim().length > 0);
}

/**
 * 안내사항 조회
 * 1순위: wedding_notices 테이블(type, content, sort_order)
 * 2순위(테이블이 없거나 비어있을 때): weddings 기존 컬럼 — "화환" 포함 문구는 화환 탭으로 분류
 */
async function fetchNoticeGroups(): Promise<NoticeGroups> {
  const groups = emptyGroups();

  const { data: rows, error } = await supabase
    .from("wedding_notices")
    .select("type, content")
    .order("sort_order", { ascending: true });

  if (!error && rows && rows.length > 0) {
    rows.forEach(({ type, content }) => {
      if (type in groups && content) groups[type as NoticeType].push(content);
    });
    return groups;
  }

  const data = await fetchWedding<{ notice_bride_room_time: string | null; venue_precautions: unknown }>(
    "notice_bride_room_time, venue_precautions"
  );
  if (data?.notice_bride_room_time) groups.bride_room.push(data.notice_bride_room_time);
  toTextList(data?.venue_precautions).forEach((item) => (item.includes("화환") ? groups.flower : groups.venue).push(item));
  return groups;
}

/** 신부대기실 / 식장 이용 / 화환 안내 섹션 (내용이 있는 탭만 표시) */
export default function Notice({ isTerminalMode }: NoticeProps) {
  const [groups, setGroups] = useState<NoticeGroups | null>(null);
  const [activeType, setActiveType] = useState<NoticeType | null>(null);

  useEffect(() => {
    fetchNoticeGroups()
      .then(setGroups)
      .catch((error) => console.error("안내사항 데이터 조회 실패:", error));
  }, []);

  const tabs = groups ? NOTICE_TABS.filter(({ type }) => groups[type].length > 0) : [];
  const currentType = tabs.find((t) => t.type === activeType)?.type ?? tabs[0]?.type;

  if (!isTerminalMode && tabs.length === 0) return null;

  return (
    <section className={styles.section}>
      {isTerminalMode ? (
        <TerminalNotice />
      ) : (
        groups &&
        currentType && (
          <motion.div
            className={styles.container}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
          >
            <SectionHeader tag="GUIDE" title="안내사항" />

            <motion.div className={styles.contentWrapper} variants={itemVariants}>
              <div className={styles.tabHeader} role="tablist">
                {tabs.map(({ type, label }) => (
                  <button
                    key={type}
                    type="button"
                    role="tab"
                    aria-selected={currentType === type}
                    className={`${styles.tabBtn} ${currentType === type ? styles.active : ""}`}
                    onClick={() => setActiveType(type)}
                  >
                    {currentType === type && (
                      <motion.span
                        layoutId="noticeTabPill"
                        className={styles.activePill}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className={styles.tabLabel}>{label}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentType}
                  className={styles.panel}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {groups[currentType].map((text, index) => (
                    <p key={index} className={styles.text}>
                      {text}
                    </p>
                  ))}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )
      )}
    </section>
  );
}
