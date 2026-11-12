"use client";

import { useState } from "react";
import Modal from "@/components/common/modal/Modal";
import m from "@/components/common/modal/Modal.module.scss";

export interface GuestbookFormValues {
  name: string;
  message: string;
  password: string;
}

interface FormModalProps {
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: GuestbookFormValues) => void;
}

/** 방명록 작성 폼 (Modal 닫힐 때 언마운트되어 입력값이 초기화됨) */
function FormBody({ loading, onSubmit }: Omit<FormModalProps, "isOpen" | "onClose">) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form
      className={m.form}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name: name.trim(), message: message.trim(), password: password.trim() });
      }}
    >
      <div className={m.row}>
        <div className={m.field}>
          <label className={m.label}>성함</label>
          <input className={m.input} value={name} maxLength={20} placeholder="성함 입력" onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className={m.field}>
          <label className={m.label}>비밀번호</label>
          <input
            className={m.input}
            type="password"
            value={password}
            maxLength={20}
            placeholder="삭제 시 사용"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>

      <div className={m.field}>
        <label className={m.label}>메시지</label>
        <textarea
          className={m.input}
          value={message}
          rows={5}
          maxLength={300}
          placeholder="신랑, 신부에게 전할 따뜻한 축하를 남겨주세요."
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <button type="submit" className={m.submitBtn} disabled={loading}>
        {loading ? "처리 중..." : "축하 메시지 남기기"}
      </button>
    </form>
  );
}

/** 방명록 작성 모달 */
export function GuestbookFormModal({ isOpen, loading, onClose, onSubmit }: FormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="축하 메시지"
    >
      <FormBody loading={loading} onSubmit={onSubmit} />
    </Modal>
  );
}

interface DeleteModalProps {
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
}

function DeleteBody({ loading, onClose, onSubmit }: Omit<DeleteModalProps, "isOpen">) {
  const [password, setPassword] = useState("");

  return (
    <form
      className={m.form}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(password.trim());
      }}
    >
      <div className={m.field}>
        <label className={m.label}>비밀번호</label>
        <input className={m.input} type="password" value={password} placeholder="작성 시 입력한 비밀번호" onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div className={m.btnGroup}>
        <button type="button" className={m.ghostBtn} onClick={onClose}>
          취소
        </button>
        <button type="submit" className={`${m.submitBtn} ${m.dangerBtn}`} disabled={loading}>
          {loading ? "삭제 중..." : "삭제"}
        </button>
      </div>
    </form>
  );
}

/** 방명록 삭제(비밀번호 확인) 모달 */
export function GuestbookDeleteModal({ isOpen, loading, onClose, onSubmit }: DeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title="메시지 삭제">
      <DeleteBody loading={loading} onClose={onClose} onSubmit={onSubmit} />
    </Modal>
  );
}
