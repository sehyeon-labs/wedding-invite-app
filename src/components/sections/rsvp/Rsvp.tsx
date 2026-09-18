"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import styles from "./Rsvp.module.scss";

interface RsvpProps {
  isTerminalMode: boolean;
  onCopyToast?: () => void;
}

export default function Rsvp({ isTerminalMode }: RsvpProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState("");
  const [meal, setMeal] = useState<string | null>("yes");
  const [count, setCount] = useState<string | null>("1");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("성함을 입력해주세요.");
      return;
    }

    setLoading(true);

    const payload = {
      name,
      attendance: "attending",
      meal,
      guests_count: Number(count),
    };

    const { error } = await supabase.from("rsvp").insert([payload]);

    if (error) {
      alert("전송 실패: " + error.message);
    } else {
      setSubmitted(true);
      handleModalClose();
    }
    setLoading(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const modalContent = isModalOpen && mounted ? createPortal(
    <div className={styles.modalOverlay} onClick={handleModalClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>참석 정보 입력</span>
          <button className={styles.closeBtn} onClick={handleModalClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.labelKey}>성함</label>
            <input
              type="text"
              placeholder="성함을 입력해주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.rowGroup}>
            <div className={styles.fieldGroup}>
              <label className={styles.labelKey}>식사 여부</label>
              <div className={styles.radioGroup}>
                <label className={`${styles.radioCard} ${meal === "yes" ? styles.active : ""}`}>
                  <input
                    type="radio"
                    name="meal"
                    value="yes"
                    checked={meal === "yes"}
                    onChange={(e) => setMeal(e.target.value)}
                  />
                  예정
                </label>
                <label className={`${styles.radioCard} ${meal === "no" ? styles.active : ""}`}>
                  <input
                    type="radio"
                    name="meal"
                    value="no"
                    checked={meal === "no"}
                    onChange={(e) => setMeal(e.target.value)}
                  />
                  안 함
                </label>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.labelKey}>동반 인원</label>
              <select value={count || "1"} onChange={(e) => setCount(e.target.value)}>
                <option value="1">1인</option>
                <option value="2">2인</option>
                <option value="3">3인</option>
                <option value="4">4인</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "전송 중..." : "참석 전달하기"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <section className={styles.section}>
      {!isTerminalMode && (
        <div className={styles.container}>
          <div className={styles.headerTag}>RSVP</div>
          <h2 className={styles.mainTitle}>참석 의사 확인</h2>

          <div className={styles.contentWrapper}>
            <div className={styles.infoTextGroup}>
              <p className={styles.desc}>
                소중한 발걸음으로 자리를 빛내주세요.<br />
                참석 여부를 미리 알려주시면 준비에 큰 도움이 됩니다.
              </p>
            </div>

            {submitted ? (
              <div className={styles.successBox}>
                <p>참석 정보가 성공적으로 전달되었습니다.</p>
                <p className={styles.subText}>소중한 걸음해 주셔서 감사합니다.</p>
              </div>
            ) : (
              <button className={styles.openModalBtn} onClick={() => setIsModalOpen(true)}>
                참석합니다
              </button>
            )}
          </div>
          {modalContent}
        </div>
      )}

      {isTerminalMode && (
        <div className={styles.terminalContainer}>
          <span className={styles.todo}>// TODO: 개발자 모드는 추후 필요할 때 구현</span>
        </div>
      )}
    </section>
  );
}