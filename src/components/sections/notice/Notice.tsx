"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./Notice.module.scss";
import TerminalNotice from "@/components/developer/TerminalNotice/TerminalNotice";

interface NoticeProps {
  isTerminalMode: boolean;
}

interface NoticeData {
  brideRoomTime: string;
  venuePrecautions: string[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Notice({ isTerminalMode }: NoticeProps) {
  const [noticeData, setNoticeData] = useState<NoticeData | null>(null);
  const [activeTab, setActiveTab] = useState<"brideRoom" | "precautions">("brideRoom");

  useEffect(() => {
    async function fetchNoticeData() {
      try {
        const { data, error } = await supabase
          .from("weddings")
          .select("notice_bride_room_time, venue_precautions")
          .limit(1)
          .single();

        if (error) throw error;
        if (data) {
          setNoticeData({
            brideRoomTime: data.notice_bride_room_time || "추후 안내될 예정입니다.",
            venuePrecautions: data.venue_precautions || [],
          });
        }
      } catch (error) {
        console.error("안내사항 데이터 조회 실패:", error);
      }
    }

    fetchNoticeData();
  }, []);

  if (!noticeData && !isTerminalMode) return null;

  return (
    <section className={styles.section}>
      {isTerminalMode ? (
        <TerminalNotice />
      ) : (
        noticeData && (
          <motion.div
            className={styles.container}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              margin: "0px 0px -80px 0px",
              amount: 0.2,
            }}
          >
            <motion.div className={styles.headerTag} variants={itemVariants}>
              GUIDE
            </motion.div>

            <motion.div className={styles.contentWrapper} variants={itemVariants}>
              {/* 탭 네비게이션 헤더 */}
              <div className={styles.tabHeader}>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === "brideRoom" ? styles.active : ""}`}
                  onClick={() => setActiveTab("brideRoom")}
                >
                  <span>신부대기실 안내</span>
                  {activeTab === "brideRoom" && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className={styles.activeIndicator}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>

                <button
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === "precautions" ? styles.active : ""}`}
                  onClick={() => setActiveTab("precautions")}
                >
                  <span>식장 이용 및 화환</span>
                  {activeTab === "precautions" && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className={styles.activeIndicator}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              </div>

              {/* 탭 패널 콘텐츠 */}
              <div className={styles.contentPanel}>
                <AnimatePresence mode="wait">
                  {activeTab === "brideRoom" ? (
                    <motion.div
                      key="brideRoom"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className={styles.panelInner}
                    >
                      <div className={styles.singleMessageCard}>
                        <p className={styles.descriptionText}>{noticeData.brideRoomTime}</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="precautions"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className={styles.panelInner}
                    >
                      <ul className={styles.noticeList}>
                        {noticeData.venuePrecautions.map((item, index) => (
                          <li key={`precaution-${index}`} className={styles.noticeCard}>
                            <span className={styles.noticeNumber}>{index + 1}</span>
                            <p className={styles.itemText}>{item}</p>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )
      )}
    </section>
  );
}