"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./Guestbook.module.scss";

interface GuestbookItem {
  id: number;
  name: string;
  message: string;
  password?: string;
  created_at: string;
}

interface GuestbookProps {
  isTerminalMode: boolean;
  onCopyToast?: (msg: string) => void;
}

export default function Guestbook({ isTerminalMode, onCopyToast }: GuestbookProps) {
  const [messages, setMessages] = useState<GuestbookItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 입력 폼 상태
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 삭제 모달 상태
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 메시지 카드별 더보기 펼침 상태 관리
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("guestbook")
      .select("id, name, message, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("방명록을 불러오는 중 오류가 발생했습니다:", error);
    } else {
      setMessages(data || []);
    }
  };

  /** 작성 모달 닫기 및 초기화 */
  const handleCloseWriteModal = () => {
    setIsModalOpen(false);
    setName("");
    setMessage("");
    setPassword("");
  };

  /** 삭제 모달 닫기 및 초기화 */
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteTargetId(null);
    setDeletePassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || !password.trim()) {
      alert("이름, 메시지, 비밀번호를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("guestbook")
      .insert([{ name, message, password }]);

    if (error) {
      alert("작성 실패: " + error.message);
    } else {
      handleCloseWriteModal();
      fetchMessages();
      setIsExpanded(false);
      
      if (onCopyToast) {
        onCopyToast("방명록이 등록되었습니다.");
      }
    }
    setLoading(false);
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteTargetId || !deletePassword) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    const { data, error } = await supabase
      .from("guestbook")
      .delete()
      .eq("id", deleteTargetId)
      .eq("password", deletePassword)
      .select();

    if (error) {
      alert("삭제 중 오류가 발생했습니다: " + error.message);
    } else if (!data || data.length === 0) {
      alert("비밀번호가 일치하지 않습니다.");
      setDeletePassword("");
    } else {
      handleCloseDeleteModal();
      fetchMessages();
      setIsExpanded(false);

      if (onCopyToast) {
        onCopyToast("방명록이 삭제되었습니다.");
      }
    }
  };

  const latestMessage = messages.length > 0 ? messages[0] : null;

  const writeModal = isModalOpen && mounted ? createPortal(
    <div className={styles.modalOverlay} onClick={handleCloseWriteModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>방명록 남기기</span>
          <button className={styles.closeBtn} onClick={handleCloseWriteModal}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.labelKey}>성함</label>
              <input
                type="text"
                placeholder="이름을 입력해주세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.labelKey}>비밀번호 (삭제용)</label>
              <input
                type="password"
                placeholder="비밀번호 4자리"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.labelKey}>축하 메시지</label>
            <textarea
              placeholder="따뜻한 축하 메시지를 남겨주세요 :)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
              className={styles.messageTextarea}
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "등록 중..." : "작성 완료"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  ) : null;

  const deleteModal = isDeleteModalOpen && mounted ? createPortal(
    <div className={styles.modalOverlay} onClick={handleCloseDeleteModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>방명록 삭제</span>
          <button className={styles.closeBtn} onClick={handleCloseDeleteModal}>×</button>
        </div>

        <form onSubmit={handleDeleteSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.labelKey}>작성 시 설정한 비밀번호를 입력해주세요.</label>
            <input
              type="password"
              placeholder="비밀번호"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.modalBtnGroup}>
            <button type="button" className={styles.cancelBtn} onClick={handleCloseDeleteModal}>
              취소
            </button>
            <button type="submit" className={styles.confirmBtn}>
              삭제하기
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;

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
          <div className={styles.headerTag}>GUESTBOOK</div>
          <h2 className={styles.mainTitle}>축하 방명록</h2>

          <div className={styles.contentWrapper}>
            <div className={styles.infoTextGroup}>
              <p className={styles.desc}>
                소중한 발걸음을 해주신 분들의<br />
                따뜻한 마음을 남겨주세요.
              </p>
            </div>

            <button className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
              방명록 남기기
            </button>

            {latestMessage && (
              <div className={styles.uploadedPhotosSection}>
                <div className={styles.feedHeaderRow}>
                  <span className={styles.subHeader}>최근 축하 메시지 ({messages.length})</span>
                </div>
                <div className={styles.messageList}>
                  <div className={styles.messageCard}>
                    <div className={styles.cardHeader}>
                      <span className={styles.name}>{latestMessage.name}</span>
                      <div className={styles.rightInfo}>
                        <span className={styles.date}>
                          {new Date(latestMessage.created_at).toLocaleDateString()}
                        </span>
                        <button 
                          className={styles.deleteBtn}
                          onClick={() => {
                            setDeleteTargetId(latestMessage.id);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    
                    {/* 엔터/띄어쓰기 유지 및 3줄 말줄임 클래스 적용 */}
                    <p className={`${styles.content} ${isExpanded ? styles.expanded : styles.clamp}`}>
                      {latestMessage.message}
                    </p>

                    {/* 더보기 / 접기 버튼 */}
                    <button 
                      className={styles.moreToggleBtn}
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      {isExpanded ? "접기 ∧" : "더보기 ∨"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {writeModal}
          {deleteModal}
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