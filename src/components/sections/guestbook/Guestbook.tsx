// src/components/sections/guestbook/Guestbook.tsx
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

export default function Guestbook() {
  const [messages, setMessages] = useState<GuestbookItem[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 삭제용 모달 상태
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deletePassword, setDeletePassword] = useState("");

  // 방명록 목록 불러오기
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("guestbook")
      .select("id, name, message, created_at") // 보안상 password는 클라이언트에 안 가져오거나 비교용으로 처리
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

  // 방명록 작성하기
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

  // 방명록 삭제하기
  const handleDelete = async (id: number) => {
    if (!deletePassword) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    // Supabase에서 해당 id와 password가 일치하는지 확인 후 삭제
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
    <div className={styles.guestbookContainer}>
      <h3>축하 방명록</h3>
      
      {/* 작성 폼 */}
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
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "등록 중..." : "방명록 남기기"}
        </button>
      </form>

      {/* 목록 표시 */}
      <div className={styles.messageList}>
        {messages.map((item) => (
          <div key={item.id} className={styles.messageCard}>
            <div className={styles.header}>
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

            {/* 삭제 비밀번호 입력창 (해당 카드 선택 시 표시) */}
            {deleteId === item.id && (
              <div className={styles.deleteBox}>
                <input
                  type="password"
                  placeholder="비밀번호 입력"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
                <button onClick={() => handleDelete(item.id)}>확인</button>
                <button onClick={() => { setDeleteId(null); setDeletePassword(""); }}>취소</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}