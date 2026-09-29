"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./Notice.module.scss";

interface NoticeProps {
  isTerminalMode: boolean;
}

/**
 * Supabase에서 신부대기실 시간 및 식장 주의사항 데이터를 조회하여 미니멀한 탭 형식으로 렌더링하는 컴포넌트
 */
export default function Notice({ isTerminalMode }: NoticeProps) {
  const [noticeData, setNoticeData] = useState<{
    brideRoomTime: string;
    venuePrecautions: string[];
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"brideRoom" | "precautions">("brideRoom");

  /** Supabase에서 안내사항 데이터 조회 */
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
        console.error("Failed to fetch notice data from Supabase:", error);
      }
    }

    fetchNoticeData();
  }, []);

  if (!noticeData) return null;

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
          <div className={styles.headerTag}>GUIDE</div>
          <h2 className={styles.mainTitle}>안내사항</h2>

          <div className={styles.contentWrapper}>
            
            {/* 탭 헤더 */}
            <div className={styles.tabHeader}>
              <button
                className={`${styles.tabBtn} ${activeTab === "brideRoom" ? styles.active : ""}`}
                onClick={() => setActiveTab("brideRoom")}
              >
                신부대기실 안내
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === "precautions" ? styles.active : ""}`}
                onClick={() => setActiveTab("precautions")}
              >
                식장 이용 및 화환
              </button>
            </div>

            {/* 상자 없는 깔끔한 텍스트 콘텐츠 영역 */}
            <div className={styles.contentPanel}>
              <AnimatePresence mode="wait">
                {activeTab === "brideRoom" ? (
                  <motion.div
                    key="brideRoom"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className={styles.panelInner}
                  >
                    <p className={styles.descriptionText}>{noticeData.brideRoomTime}</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="precautions"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className={styles.panelInner}
                  >
                    <ul className={styles.bulletList}>
                      {noticeData.venuePrecautions.map((item, index) => (
                        <li key={`precaution-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
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