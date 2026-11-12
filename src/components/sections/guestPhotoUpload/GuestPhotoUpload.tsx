"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { fetchWedding } from "@/lib/supabaseHelpers";
import { containerVariants, itemVariants, sectionViewport } from "@/utils/motion";
import Modal from "@/components/common/modal/Modal";
import SectionHeader from "@/components/common/sectionHeader/SectionHeader";
import TerminalGuestPhotoUpload from "@/components/developer/TerminalGuestPhotoUpload/TerminalGuestPhotoUpload";
import m from "@/components/common/modal/Modal.module.scss";
import styles from "./GuestPhotoUpload.module.scss";

interface GuestPhoto {
  id: number;
  sender_name: string;
  photo_url: string;
  created_at: string;
}

interface GuestPhotoUploadProps {
  isTerminalMode: boolean;
  onToast?: (msg: string) => void;
}

const MAX_UPLOAD_COUNT = 20;

/** 하객 사진첩 섹션: 예식일 이후 사진 업로드 + 최근 업로드 사진 가로 목록 */
export default function GuestPhotoUpload({ isTerminalMode, onToast }: GuestPhotoUploadProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWeddingPassed, setIsWeddingPassed] = useState(true);
  const [senderName, setSenderName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("guest_photos")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("사진 목록 조회 실패:", error.message);
        else if (data) setPhotos(data);
      });

    // 예식일 당일 이전에는 업로드 비활성화
    fetchWedding<{ wedding_date: string | null }>("wedding_date")
      .then((data) => {
        if (!data?.wedding_date) return;
        const today = new Date().setHours(0, 0, 0, 0);
        const weddingDay = new Date(data.wedding_date).setHours(0, 0, 0, 0);
        if (today < weddingDay) setIsWeddingPassed(false);
      })
      .catch((error) => console.error("예식일 조회 실패:", error));
  }, []);

  // 미리보기 URL 메모리 해제
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const resetForm = () => {
    setFiles([]);
    setPreviews([]);
    setSenderName("");
  };

  const closeModal = () => {
    if (loading) return;
    setIsModalOpen(false);
    resetForm();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > MAX_UPLOAD_COUNT) {
      onToast?.(`사진은 최대 ${MAX_UPLOAD_COUNT}장까지 올릴 수 있습니다.`);
      return;
    }
    if (selected.length > 0) {
      setFiles(selected);
      setPreviews(selected.map((file) => URL.createObjectURL(file)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) return onToast?.("성함을 입력해주세요.");
    if (files.length === 0) return onToast?.("보낼 사진을 1장 이상 선택해주세요.");

    setLoading(true);
    try {
      const added: GuestPhoto[] = [];

      for (const file of files) {
        const ext = file.name.split(".").pop();
        const filePath = `uploads/${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage.from("guest-photos").upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("guest-photos").getPublicUrl(filePath);
        const { data: inserted, error: dbError } = await supabase
          .from("guest_photos")
          .insert([{ sender_name: senderName.trim(), photo_url: urlData.publicUrl }])
          .select();

        if (dbError) console.warn("DB 저장 실패:", dbError.message);
        else if (inserted) added.push(inserted[0]);
      }

      if (added.length > 0) setPhotos((prev) => [...added, ...prev]);

      setIsModalOpen(false);
      resetForm();
      onToast?.("사진 업로드가 완료되었습니다.");
      setTimeout(() => scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" }), 100);
    } catch (err) {
      console.error("사진 업로드 실패:", err);
      onToast?.("업로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.section}>
      {isTerminalMode ? (
        <TerminalGuestPhotoUpload />
      ) : (
        <motion.div
          className={styles.container}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          <SectionHeader tag="MEMORY" title="하객 사진첩" />

          <motion.p className={styles.desc} variants={itemVariants}>
            예식장에서 함께 찍은 사진이나 축하 순간을
            <br />
            신랑·신부에게 전송해 주세요!
          </motion.p>

          <motion.button
            type="button"
            variants={itemVariants}
            className={`${styles.primaryBtn} ${!isWeddingPassed ? styles.disabledBtn : ""}`}
            onClick={() => setIsModalOpen(true)}
            disabled={!isWeddingPassed}
          >
            {isWeddingPassed ? "사진 보내기" : "결혼식 당일부터 업로드 가능합니다"}
          </motion.button>

          {photos.length > 0 && (
            <motion.div className={styles.uploadedSection} variants={itemVariants}>
              <span className={styles.subHeader}>최근 업로드된 사진 ({photos.length})</span>
              <div className={styles.thumbRow} ref={scrollRef}>
                {photos.map((item) => (
                  <div key={item.id} className={styles.thumb}>
                    <img src={item.photo_url} alt={item.sender_name} />
                    <span className={styles.authorLabel}>{item.sender_name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            title="사진 보내기"
          >
            <form onSubmit={handleSubmit} className={m.form}>
              <div className={m.field}>
                <label className={m.label}>성함</label>
                <input
                  className={m.input}
                  type="text"
                  value={senderName}
                  maxLength={20}
                  placeholder="성함을 입력해주세요"
                  onChange={(e) => setSenderName(e.target.value)}
                  required
                />
              </div>

              <div className={m.field}>
                <label className={m.label}>
                  사진 선택 ({files.length}/{MAX_UPLOAD_COUNT})
                </label>
                <label className={styles.dropZone}>
                  {previews.length > 0 ? (
                    <div className={styles.previewGrid}>
                      {previews.map((src, idx) => (
                        <img key={src} src={src} alt={`미리보기 ${idx + 1}`} />
                      ))}
                    </div>
                  ) : (
                    <div className={styles.dropPlaceholder}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="9" cy="9" r="1.8" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                      <span>사진 선택하기 (최대 {MAX_UPLOAD_COUNT}장)</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" multiple hidden onChange={handleFileChange} />
                </label>
              </div>

              <button type="submit" className={m.submitBtn} disabled={loading}>
                {loading ? "업로드 중..." : `사진 ${files.length > 0 ? `${files.length}장 ` : ""}전송하기`}
              </button>
            </form>
          </Modal>
        </motion.div>
      )}
    </section>
  );
}
