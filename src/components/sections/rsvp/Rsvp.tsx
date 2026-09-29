"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import RsvpModal from "@/components/common/modal/rsvp/RsvpModal";
import styles from "./Rsvp.module.scss";

interface RsvpProps {
  isTerminalMode: boolean;
  onCopyToast?: () => void;
}

export default function Rsvp({ isTerminalMode }: RsvpProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRsvpSubmit = async (formData: { 
    side: string; 
    name: string; 
    meal: string | null; 
    count: number; 
    phone: string; 
  }) => {
    setLoading(true);

    const payload = {
      side: formData.side,
      name: formData.name,
      attendance: "attending",
      meal: formData.meal,
      guests_count: formData.count,
      phone: formData.phone, // 추가된 phone 컬럼 연동
    };

    const { error } = await supabase.from("rsvp").insert([payload]);

    if (error) {
      alert("전송 실패: " + error.message);
    } else {
      setSubmitted(true);
      setIsModalOpen(false);
    }
    setLoading(false);
  };

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

          {mounted && createPortal(
            <RsvpModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleRsvpSubmit}
              loading={loading}
            />,
            document.body
          )}
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