"use client";

import { useState } from "react";
import Modal from "@/components/common/modal/Modal";
import m from "@/components/common/modal/Modal.module.scss";
import styles from "./RsvpModal.module.scss";

export interface RsvpFormData {
  side: "groom" | "bride";
  name: string;
  meal: "yes" | "no";
  count: number;
  phone: string;
}

interface RsvpModalProps {
  isOpen: boolean;
  /** 이전에 전송한 정보 (있으면 입력창에 미리 채움) */
  initial?: RsvpFormData | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: RsvpFormData) => void;
  onInvalid: (message: string) => void;
}

const TOTAL_STEPS = 5;
const MAX_COUNT = 10;

/** 선택지 카드 목록 (선택 시 은은한 강조 + 체크 표시) */
function Choice<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className={styles.choices}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`${styles.choice} ${value === opt.value ? styles.selected : ""}`}
          onClick={() => onChange(opt.value)}
        >
          <span>{opt.label}</span>
          {value === opt.value && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}

/** 한 화면에 한 가지씩 입력받는 5단계 참석 폼 */
function RsvpForm({ initial, loading, onSubmit, onInvalid }: Pick<RsvpModalProps, "initial" | "loading" | "onSubmit" | "onInvalid">) {
  const [step, setStep] = useState(0);
  const [side, setSide] = useState<RsvpFormData["side"] | null>(initial?.side ?? null);
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [count, setCount] = useState(initial?.count ?? 1);
  const [meal, setMeal] = useState<RsvpFormData["meal"] | null>(initial?.meal ?? null);

  const isLast = step === TOTAL_STEPS - 1;

  /** 현재 단계 입력 검증 (통과 시 true) */
  const validate = () => {
    const error = [
      !side && "신랑 측 / 신부 측을 선택해주세요.",
      !name.trim() && "성함을 입력해주세요.",
      phone.length !== 4 && "연락처 뒷자리 4자리를 입력해주세요.",
      "",
      !meal && "식사 여부를 선택해주세요.",
    ][step];
    if (error) onInvalid(error);
    return !error;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!isLast) return setStep((s) => s + 1);
    onSubmit({ side: side!, name: name.trim(), phone, count, meal: meal! });
  };

  const questions = [
    <>
      <p className={styles.question}>어느 쪽 손님이신가요?</p>
      <Choice
        value={side}
        onChange={(v) => {
          setSide(v);
          setStep(1);
        }}
        options={[
          { value: "groom", label: "신랑 측" },
          { value: "bride", label: "신부 측" },
        ]}
      />
    </>,
    <>
      <p className={styles.question}>참석하시는 분의 성함을 알려주세요.</p>
      <input className={m.input} value={name} maxLength={20} placeholder="성함" autoFocus onChange={(e) => setName(e.target.value)} />
    </>,
    <>
      <p className={styles.question}>연락처 뒷자리 4자리를 입력해주세요.</p>
      <input
        className={m.input}
        type="tel"
        inputMode="numeric"
        value={phone}
        maxLength={4}
        placeholder="예) 1234"
        autoFocus
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
      />
    </>,
    <>
      <p className={styles.question}>본인 포함 몇 분이 참석하시나요?</p>
      <div className={styles.counter}>
        <button type="button" onClick={() => setCount((c) => Math.max(1, c - 1))} disabled={count <= 1} aria-label="한 명 줄이기">
          −
        </button>
        <span className={styles.countValue}>{count}명</span>
        <button type="button" onClick={() => setCount((c) => Math.min(MAX_COUNT, c + 1))} disabled={count >= MAX_COUNT} aria-label="한 명 늘리기">
          +
        </button>
      </div>
    </>,
    <>
      <p className={styles.question}>식사는 하실 예정인가요?</p>
      <Choice
        value={meal}
        onChange={setMeal}
        options={[
          { value: "yes", label: "먹어요" },
          { value: "no", label: "안 먹어요" },
        ]}
      />
      <p className={styles.notice}>같은 성함·연락처로 다시 입력하시면 내용이 수정됩니다.</p>
    </>,
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.wizard}>
      <div className={styles.progress} aria-label={`${step + 1} / ${TOTAL_STEPS} 단계`}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <span key={i} className={i <= step ? styles.done : ""} />
        ))}
      </div>

      <div className={styles.body}>{questions[step]}</div>

      <div className={styles.actions}>
        {step > 0 && (
          <button type="button" className={styles.backBtn} onClick={() => setStep((s) => s - 1)} disabled={loading}>
            이전
          </button>
        )}
        <button type="submit" className={styles.nextBtn} disabled={loading}>
          {isLast ? (loading ? "전송 중..." : initial ? "수정하기" : "참석 전달하기") : "다음"}
        </button>
      </div>
    </form>
  );
}

/** 참석 정보 입력 바텀시트 모달 */
export default function RsvpModal({ isOpen, onClose, ...formProps }: RsvpModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="참석 정보 입력" placement="bottom">
      <RsvpForm {...formProps} />
    </Modal>
  );
}
