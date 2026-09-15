// src/components/sections/rsvp/Rsvp.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import styles from "./Rsvp.module.scss";

export default function Rsvp() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState("attending");
  // 타입을 string 또는 null을 허용하도록 명시해 줍니다.
  const [meal, setMeal] = useState<string | null>("yes");
  const [count, setCount] = useState<string | null>("1");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // SSR 환경에서 document 안전하게 접근하기 위한 처리
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

    // 불참인 경우 meal과 guests_count를 null로 처리
    const payload = {
      name,
      attendance,
      meal: attendance === "attending" ? meal : null,
      guests_count: attendance === "attending" ? Number(count) : null,
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

  // 모달 컴포넌트 (Portal을 통해 body에 직접 렌더링)
  const modalContent = isModalOpen && mounted ? createPortal(
    <div className={styles.modalOverlay} onClick={handleModalClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>// RSVP_INPUT_FORM</span>
          <button className={styles.closeBtn} onClick={handleModalClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.labelKey}>name</label>
            <input
              type="text"
              placeholder="성함을 입력해주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.labelKey}>attendance</label>
            <div className={styles.radioGroup}>
              <label className={`${styles.radioCard} ${attendance === "attending" ? styles.active : ""}`}>
                <input
                  type="radio"
                  name="attendance"
                  value="attending"
                  checked={attendance === "attending"}
                  onChange={(e) => setAttendance(e.target.value)}
                />
                참석
              </label>
              <label className={`${styles.radioCard} ${attendance === "not_attending" ? styles.active : ""}`}>
                <input
                  type="radio"
                  name="attendance"
                  value="not_attending"
                  checked={attendance === "not_attending"}
                  onChange={(e) => setAttendance(e.target.value)}
                />
                불참
              </label>
            </div>
          </div>

          {attendance === "attending" && (
            <div className={styles.rowGroup}>
              <div className={styles.fieldGroup}>
                <label className={styles.labelKey}>meal</label>
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
                <label className={styles.labelKey}>count</label>
                <select value={count || "1"} onChange={(e) => setCount(e.target.value)}>
                  <option value="1">1인</option>
                  <option value="2">2인</option>
                  <option value="3">3인</option>
                  <option value="4">4인</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "전송 중..." : "제출하기"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        
        <div className={styles.headerTag}>
          <span>&gt; cat rsvp.config</span>
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.infoTextGroup}>
            <span className={styles.configHeader}>// RSVP_GUIDE</span>
            <p className={styles.desc}>
              소중한 발걸음으로 자리를 빛내주세요.<br />
              참석 여부를 미리 알려주시면 준비에 큰 도움이 됩니다.
            </p>
          </div>

          {submitted ? (
            <div className={styles.successBox}>
              <span className={styles.configHeader}>// STATUS: SUCCESS</span>
              <p>참석 여부가 성공적으로 전달되었습니다.</p>
              <p className={styles.subText}>소중한 걸음해 주셔서 감사합니다.</p>
            </div>
          ) : (
            <button className={styles.openModalBtn} onClick={() => setIsModalOpen(true)}>
              참석 여부 전달하기
            </button>
          )}
        </div>

        {modalContent}

      </div>
    </section>
  );
}