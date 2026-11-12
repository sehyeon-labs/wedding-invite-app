"use client";

import { useState, useMemo, useRef, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { containerVariants, itemVariants, sectionViewport } from "@/utils/motion";
import RsvpModal, { RsvpFormData } from "@/components/common/modal/rsvp/RsvpModal";
import { RsvpPromptModal, RsvpDoneModal } from "@/components/common/modal/rsvp/RsvpResultModals";
import SectionHeader from "@/components/common/sectionHeader/SectionHeader";
import TerminalRsvp from "@/components/developer/TerminalRsvp/TerminalRsvp";
import styles from "./Rsvp.module.scss";

interface RsvpProps {
  isTerminalMode: boolean;
  onToast?: (msg: string) => void;
}

const STORAGE_KEY = "wedding_rsvp_submitted";

const PROMPT_KEY = "wedding_rsvp_prompt_seen";

const CHANGE_EVENT = "rsvp-submitted-change";

const subscribe = (callback: () => void) => {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
};

const getStoredRaw = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

/** 전송 완료 정보를 기기에 저장 (새로고침 후에도 재전송 차단) */
const saveSubmitted = (data: RsvpFormData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* 저장소 사용 불가 시 현재 세션에서만 차단 */
  }
};

/** 참석 의사 확인 섹션: 같은 성함·연락처로 다시 입력하면 기존 응답을 수정 */
export default function Rsvp({ isTerminalMode, onToast }: RsvpProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDoneOpen, setIsDoneOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionSubmitted, setSubmitted] = useState<RsvpFormData | null>(null);
  const submittingRef = useRef(false);

  const storedRaw = useSyncExternalStore(subscribe, getStoredRaw, () => null);
  const submitted = useMemo<RsvpFormData | null>(() => {
    if (!storedRaw) return sessionSubmitted;
    try {
      return JSON.parse(storedRaw) as RsvpFormData;
    } catch {
      return sessionSubmitted;
    }
  }, [storedRaw, sessionSubmitted]);

  /** RSVP 섹션에 처음 진입하면 참석 여부 안내 모달 표시 (이미 응답했거나 한 번 본 기기는 제외) */
  const handleSectionEnter = () => {
    if (getStoredRaw() || localStorage.getItem(PROMPT_KEY)) return;
    setIsPromptOpen(true);
  };

  const closePrompt = () => {
    setIsPromptOpen(false);
    try {
      localStorage.setItem(PROMPT_KEY, "1");
    } catch {
      /* 저장소 사용 불가 시 무시 */
    }
  };
  const handleSubmit = async (form: RsvpFormData) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);

    try {
      // 같은 성함·연락처가 있으면 수정, 없으면 신규 등록 (조회 권한이 없으면 신규 등록)
      const { data: existing } = await supabase
        .from("rsvp")
        .select("id")
        .eq("name", form.name)
        .eq("phone", form.phone)
        .limit(1);

      const values = { side: form.side, meal: form.meal, guests_count: form.count };
      const isUpdate = !!existing?.length;

      if (isUpdate) {
        const { data: updated, error } = await supabase.from("rsvp").update(values).eq("id", existing![0].id).select("id");
        if (error) throw error;
        if (!updated?.length) throw new Error("수정 권한이 없습니다.");
      } else {
        const { error } = await supabase
          .from("rsvp")
          .insert([{ ...values, name: form.name, phone: form.phone, attendance: "attending" }]);
        if (error) throw error;
      }

      saveSubmitted(form);
      setSubmitted(form);
      setIsModalOpen(false);
      setIsDoneOpen(true);
    } catch (error) {
      console.error("참석 의사 전송 실패:", error);
      onToast?.("전송에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <section className={styles.section}>
      {isTerminalMode ? (
        <TerminalRsvp />
      ) : (
        <motion.div
          className={styles.container}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          onViewportEnter={handleSectionEnter}
        >
          <SectionHeader tag="RSVP" title="참석 의사 확인" />

          <motion.p className={styles.desc} variants={itemVariants}>
            소중한 발걸음으로 자리를 빛내주세요.
            <br />
            참석 여부를 미리 알려주시면 준비에 큰 도움이 됩니다.
          </motion.p>

          <motion.div className={styles.action} variants={itemVariants}>
            {submitted ? (
              <button type="button" className={styles.openBtn} onClick={() => setIsDoneOpen(true)}>
                참석 정보 확인
              </button>
            ) : (
              <button type="button" className={styles.openBtn} onClick={() => setIsModalOpen(true)}>
                참석합니다
              </button>
            )}
          </motion.div>

          <RsvpPromptModal
            isOpen={isPromptOpen}
            onDismiss={closePrompt}
            onAccept={() => {
              closePrompt();
              setIsModalOpen(true);
            }}
          />

          <RsvpDoneModal
            isOpen={isDoneOpen}
            data={submitted}
            onClose={() => setIsDoneOpen(false)}
            onEdit={() => {
              setIsDoneOpen(false);
              setIsModalOpen(true);
            }}
          />

          <RsvpModal
            isOpen={isModalOpen}
            initial={submitted}
            loading={loading}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
            onInvalid={(msg) => onToast?.(msg)}
          />
        </motion.div>
      )}
    </section>
  );
}
