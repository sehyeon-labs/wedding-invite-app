"use client";

import React, { useState } from "react";
import { getAssetPath } from "@/utils/path";
import styles from "./RsvpModal.module.scss";

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    side: string;
    name: string;
    meal: string | null;
    count: number;
    phone: string;
  }) => Promise<void>;
  loading: boolean;
}

export default function RsvpModal({ isOpen, onClose, onSubmit, loading }: RsvpModalProps) {
  const [side, setSide] = useState<string>("groom");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [meal, setMeal] = useState<string | null>("yes");
  const [count, setCount] = useState<string | null>("1");

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("성함을 입력해주세요.");
      return;
    }
    if (!phone.trim()) {
      alert("연락처를 입력해주세요.");
      return;
    }

    await onSubmit({
      side,
      name,
      meal,
      count: Number(count),
      phone,
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>참석 정보 입력</span>
          <button type="button" className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleFormSubmit} className={styles.form}>
          {/* 1. 신랑 / 신부 측 박스 선택 */}
          <div className={styles.fieldGroup}>
            <label className={styles.labelKey}>구분</label>
            <div className={styles.segmentGroup}>
              <button
                type="button"
                className={`${styles.segmentBtn} ${side === "groom" ? styles.active : ""}`}
                onClick={() => setSide("groom")}
              >
                신랑 측
              </button>
              <button
                type="button"
                className={`${styles.segmentBtn} ${side === "bride" ? styles.active : ""}`}
                onClick={() => setSide("bride")}
              >
                신부 측
              </button>
            </div>
          </div>

          {/* 2. 성명 입력 */}
          <div className={styles.fieldGroup}>
            <label className={styles.labelKey}>성함</label>
            <input
              type="text"
              placeholder="성함을 입력해주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.textInput}
              required
            />
          </div>

          {/* 3. 연락처 입력 */}
          <div className={styles.fieldGroup}>
            <label className={styles.labelKey}>연락처 (뒤 4자리 또는 전체)</label>
            <input
              type="text"
              placeholder="예: 1234"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.textInput}
              required
            />
          </div>

          <div className={styles.rowGroup}>
            {/* 4. 식사 여부 박스 선택 */}
            <div className={styles.fieldGroup}>
              <label className={styles.labelKey}>식사 여부</label>
              <div className={styles.segmentGroup}>
                <button
                  type="button"
                  className={`${styles.segmentBtn} ${meal === "yes" ? styles.active : ""}`}
                  onClick={() => setMeal("yes")}
                >
                  예정
                </button>
                <button
                  type="button"
                  className={`${styles.segmentBtn} ${meal === "no" ? styles.active : ""}`}
                  onClick={() => setMeal("no")}
                >
                  안 함
                </button>
              </div>
            </div>

            {/* 5. 동반 인원 커스텀 드롭다운 */}
            <div className={styles.fieldGroup}>
              <label className={styles.labelKey}>동반 인원</label>
              <div className={styles.selectWrapper}>
                <select
                  value={count || "1"}
                  onChange={(e) => setCount(e.target.value)}
                  className={styles.selectInput}
                  disabled={meal === "no"}
                >
                  <option value="1">1인</option>
                  <option value="2">2인</option>
                  <option value="3">3인</option>
                  <option value="4">4인</option>
                </select>
                <img
                  src={getAssetPath("/icon/up.png")}
                  alt="선택 화살표"
                  className={styles.selectArrowIcon}
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "전송 중..." : "참석 전달하기"}
          </button>
        </form>
      </div>
    </div>
  );
}