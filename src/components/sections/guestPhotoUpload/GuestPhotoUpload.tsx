// src/components/sections/gallery/GuestPhotoUpload.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import mockData from "@/data/mock.json";
import styles from "./GuestPhotoUpload.module.scss";

interface GuestPhoto {
  id: number;
  sender_name: string;
  photo_url: string;
  created_at: string;
}

export default function GuestPhotoUpload() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isWeddingPassed, setIsWeddingPassed] = useState(true); // 기본값 true (렌더링 직후 체크)

  const [senderName, setSenderName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const MAX_UPLOAD_COUNT = 20;

  // 가로 스크롤 컨테이너 제어용 ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchPhotos();

    // 결혼식 날짜 비교 체크
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weddingDay = new Date(mockData.weddingDate);
    weddingDay.setHours(0, 0, 0, 0);

    // 오늘이 결혼식 당일보다 이전인지 확인
    if (today < weddingDay) {
      setIsWeddingPassed(false);
    }
  }, []);

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from("guest_photos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("사진 목록 조회 실패:", error.message);
    } else if (data) {
      setPhotos(data);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length > MAX_UPLOAD_COUNT) {
      alert(`사진은 최대 ${MAX_UPLOAD_COUNT}장까지만 업로드 가능합니다.`);
      return;
    }

    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
      setPreviews(previewUrls);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) {
      alert("성함을 입력해주세요.");
      return;
    }
    if (files.length === 0) {
      alert("보낼 사진을 최소 1장 이상 선택해주세요.");
      return;
    }

    setLoading(true);

    try {
      const newlyAddedPhotos: GuestPhoto[] = [];

      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("guest-photos")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("guest-photos")
          .getPublicUrl(filePath);

        const photoUrl = publicUrlData.publicUrl;

        const { data: insertedData, error: dbError } = await supabase.from("guest_photos").insert([
          {
            sender_name: senderName,
            photo_url: photoUrl,
          },
        ]).select();

        if (dbError) {
          console.warn("DB 저장 실패:", dbError.message);
        } else if (insertedData) {
          newlyAddedPhotos.push(insertedData[0]);
        }
      }

      if (newlyAddedPhotos.length > 0) {
        setPhotos((prev) => [...newlyAddedPhotos, ...prev]);
      }

      alert("사진들이 성공적으로 전달되었습니다!");
      setIsUploadModalOpen(false);
      setFiles([]);
      setPreviews([]);
      setSenderName("");

      // 업로드 완료 후 가로 스크롤을 맨 앞으로 확실하게 이동
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            left: 0,
            behavior: "smooth"
          });
        }
      }, 100);

    } catch (err: any) {
      alert("업로드 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 1. 사진 업로드 모달
  const uploadModal = isUploadModalOpen && mounted ? createPortal(
    <div className={styles.modalOverlay} onClick={() => setIsUploadModalOpen(false)}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>// UPLOAD_PHOTOS.sh</span>
          <button className={styles.closeBtn} onClick={() => setIsUploadModalOpen(false)}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.labelKey}>sender_name</label>
            <input
              type="text"
              placeholder="성함을 입력해주세요"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.labelKey}>
              select_images ({files.length}/{MAX_UPLOAD_COUNT}장 선택됨)
            </label>
            <label className={styles.fileDropZone}>
              {previews.length > 0 ? (
                <div className={styles.previewGrid}>
                  {previews.map((src, idx) => (
                    <img key={idx} src={src} alt={`Preview ${idx}`} className={styles.previewImg} />
                  ))}
                </div>
              ) : (
                <div className={styles.placeholderText}>
                  <span>+ 사진 선택하기 (최대 {MAX_UPLOAD_COUNT}장)</span>
                  <span className={styles.sub}>JPG, PNG 형식 지원</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleFileChange} 
                style={{ display: "none" }} 
              />
            </label>
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "업로드 중..." : `사진 ${files.length > 0 ? `${files.length}장 ` : ""}전송하기`}
          </button>
        </form>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.headerTag}>
          <span>&gt; cat send_photos.config</span>
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.infoTextGroup}>
            <span className={styles.configHeader}>// GUEST_MEMORY</span>
            <p className={styles.desc}>
              결식장에서 함께 찍은 사진이나 축하 순간을<br />
              신랑·신부에게 전송해 주세요!
            </p>
          </div>

          {/* 결혼식 전에는 버튼 비활성화 및 문구 변경, 당일 이후에는 활성화 */}
          <button 
            className={`${styles.primaryBtn} ${!isWeddingPassed ? styles.disabledBtn : ""}`} 
            onClick={() => isWeddingPassed && setIsUploadModalOpen(true)}
            disabled={!isWeddingPassed}
          >
            {isWeddingPassed ? "사진 보내기" : "결혼식 당일 이후부터 업로드 가능합니다"}
          </button>

          {/* 하단 가로 스크롤 피드 영역 */}
          {photos.length > 0 && (
            <div className={styles.uploadedPhotosSection}>
              <div className={styles.feedHeaderRow}>
                <span className={styles.subHeader}>// RECENT_UPLOADS ({photos.length})</span>
              </div>
              <div className={styles.horizontalScrollRow} ref={scrollContainerRef}>
                {photos.map((item) => (
                  <div key={item.id} className={styles.scrollThumb}>
                    <img src={item.photo_url} alt={item.sender_name} />
                    <span className={styles.miniAuthorLabel}>{item.sender_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {uploadModal}
      </div>
    </section>
  );
}