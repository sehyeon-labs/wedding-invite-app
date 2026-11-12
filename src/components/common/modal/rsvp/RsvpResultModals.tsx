"use client";

import Modal from "@/components/common/modal/Modal";
import m from "@/components/common/modal/Modal.module.scss";
import type { RsvpFormData } from "./RsvpModal";
import styles from "./RsvpResultModals.module.scss";

interface PromptModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}

/** 첫 방문 시 참석 여부를 먼저 묻는 중앙 모달 ("참석합니다" → 입력 모달로 이동) */
export function RsvpPromptModal({ isOpen, onAccept, onDismiss }: PromptModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onDismiss} title="참석 여부" size="sm" duration={0.9}>
      <p className={styles.promptText}>
        소중한 자리에 함께해 주실 수 있나요?
        <br />
        미리 알려주시면 큰 도움이 됩니다.
      </p>
      <div className={m.btnGroup}>
        <button type="button" className={m.ghostBtn} onClick={onDismiss}>
          다음에 할게요
        </button>
        <button type="button" className={`${m.submitBtn} ${styles.flex2}`} onClick={onAccept}>
          참석합니다
        </button>
      </div>
    </Modal>
  );
}

interface DoneModalProps {
  isOpen: boolean;
  data: RsvpFormData | null;
  onClose: () => void;
  onEdit: () => void;
}

/** 참석 정보 저장/수정 완료 확인 모달 */
export function RsvpDoneModal({ isOpen, data, onClose, onEdit }: DoneModalProps) {
  return (
    <Modal isOpen={isOpen && !!data} onClose={onClose} title="참석 정보" size="sm">
      {data && (
        <div className={styles.done}>
          <div className={styles.checkIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <strong className={styles.title}>참석 정보가 전달되었습니다</strong>
          <div className={styles.chips}>
            <span>{data.name}</span>
            <span>{data.side === "groom" ? "신랑 측" : "신부 측"}</span>
            <span>{data.count}명</span>
            <span>{data.meal === "yes" ? "식사 함" : "식사 안 함"}</span>
          </div>
          <span className={styles.subText}>소중한 걸음해 주셔서 감사합니다.</span>
          <div className={`${m.btnGroup} ${styles.btns}`}>
            <button type="button" className={m.ghostBtn} onClick={onEdit}>
              정보 수정
            </button>
            <button type="button" className={`${m.submitBtn} ${styles.flex2}`} onClick={onClose}>
              확인
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
