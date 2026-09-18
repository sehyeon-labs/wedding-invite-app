"use client";

import { useState, useEffect } from "react";
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
  onCopyToast?: () => void;
}

export default function Guestbook({ isTerminalMode }: GuestbookProps) {
  const [messages, setMessages] = useState<GuestbookItem[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deletePassword, setDeletePassword] = useState("");

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

  useEffect(() => {
    fetchMessages();
  }, []);

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
      setName("");
      setMessage("");
      setPassword("");
      fetchMessages();
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!deletePassword) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    const { data, error } = await supabase
      .from("guestbook")
      .delete()
      .eq("id", id)
      .eq("password", deletePassword)
      .select();

    if (error) {
      alert("삭제 중 오류가 발생했습니다: " + error.message);
    } else if (!data || data.length === 0) {
      alert("비밀번호가 일치하지 않습니다.");
    } else {
      alert("방명록이 삭제되었습니다.");
      setDeleteId(null);
      setDeletePassword("");
      fetchMessages();
    }
  };

  return (
    <section className={styles.section}>
      {!isTerminalMode && (
        <div className={styles.container}>
          <div className={styles.headerTag}>GUESTBOOK</div>
          <h2 className={styles.mainTitle}>축하 방명록</h2>

          <div className={styles.contentWrapper}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.row}>
                <input
                  type="text"
                  placeholder="이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="비밀번호 (삭제용)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <textarea
                placeholder="따뜻한 축하 메시지를 남겨주세요 :)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                required
              />
              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? "등록 중..." : "방명록 남기기"}
              </button>
            </form>

            <div className={styles.messageList}>
              {messages.map((item) => (
                <div key={item.id} className={styles.messageCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.name}>{item.name}</span>
                    <div className={styles.rightInfo}>
                      <span className={styles.date}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => setDeleteId(item.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  <p className={styles.content}>{item.message}</p>

                  {deleteId === item.id && (
                    <div className={styles.deleteBox}>
                      <input
                        type="password"
                        placeholder="비밀번호 입력"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                      />
                      <div className={styles.deleteBtnGroup}>
                        <button className={styles.confirmBtn} onClick={() => handleDelete(item.id)}>확인</button>
                        <button className={styles.cancelBtn} onClick={() => { setDeleteId(null); setDeletePassword(""); }}>취소</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
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