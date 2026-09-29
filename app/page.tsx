"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./page.module.scss";
import { supabase } from "@/lib/supabase";

// 컴포넌트 섹션 모듈 임포트
import Cover from "@/components/sections/cover/Cover";
import Greeting from "@/components/sections/greeting/Greeting";
import Dday from "@/components/sections/dday/Dday";
import Gallery from "@/components/sections/gallery/Gallery";
import ContactAccount from "@/components/sections/contactAccount/ContactAccount";
import Reception from "@/components/sections/reception/Reception";
import Location from "@/components/sections/location/Location";
import Guestbook from "@/components/sections/guestbook/Guestbook";
import Rsvp from "@/components/sections/rsvp/Rsvp";
import GuestPhotoUpload from "@/components/sections/guestPhotoUpload/GuestPhotoUpload";
import CustomText from "@/components/sections/customText/CustomText";
import Toast from "@/components/common/toast/Toast";
import Notice from "@/components/sections/notice/Notice";
import Share from "@/components/sections/share/Share";

interface WeddingVerse {
  verse: string;
  reference: string;
}

/**
 * 메인 청첩장 페이지 컴포넌트
 */
export default function Page() {
  const [isTerminalMode, setIsTerminalMode] = useState(false);
  const [isLoaderActive, setIsLoaderActive] = useState(false);
  const [verseData, setVerseData] = useState<WeddingVerse>({ verse: "", reference: "" });
  const [coupleNames, setCoupleNames] = useState({ groom: "신랑", bride: "신부" });
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("복사되었습니다.");

  const hasLoadedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /** Supabase에서 성경구절 및 신랑/신부 이름 데이터 조회 */
  useEffect(() => {
    async function fetchPageData() {
      try {
        const { data: weddingData, error: weddingError } = await supabase
          .from("weddings")
          .select("bible_verse, bible_reference")
          .limit(1)
          .single();

        if (weddingError) throw weddingError;

        if (weddingData) {
          setVerseData({
            verse: weddingData.bible_verse || "",
            reference: weddingData.bible_reference || "",
          });
        }

        // family_members 테이블에서 신랑, 신부 이름 조회
        const { data: memberData, error: memberError } = await supabase
          .from("wedding_family_members")
          .select("role_type, name")
          .in("role_type", ["groom", "bride"]);

        if (!memberError && memberData) {
          const groomObj = memberData.find(m => m.role_type === "groom");
          const brideObj = memberData.find(m => m.role_type === "bride");
          setCoupleNames({
            groom: groomObj?.name || "신랑",
            bride: brideObj?.name || "신부",
          });
        }
      } catch (error) {
        console.error("Failed to fetch page data from Supabase:", error);
      }
    }

    fetchPageData();
  }, []);

  /** 토스트 메시지 출력 및 2초 후 자동 숨김 처리 */
  const handleTriggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div 
      ref={containerRef} 
      className={`${styles.container} ${isLoaderActive ? styles.lockScroll : ""}`}
    >
      <Cover 
        isTerminalMode={isTerminalMode}
        hasLoadedRef={hasLoadedRef}
        onLoadingChange={setIsLoaderActive}
      />
      
      <CustomText
        isTerminalMode={isTerminalMode}
        title={verseData.verse}
        content={verseData.reference}
      />

      <Dday isTerminalMode={isTerminalMode} />

      <Greeting isTerminalMode={isTerminalMode} />

      <Gallery isTerminalMode={isTerminalMode} />

      <Location 
        isTerminalMode={isTerminalMode}
        onCopyToast={() => handleTriggerToast("주소가 복사되었습니다.")}
      />

      <Notice
        isTerminalMode={isTerminalMode}
      />

      <Reception 
        isTerminalMode={isTerminalMode} 
        onCopyToast={() => handleTriggerToast("계좌번호가 복사되었습니다.")}
      />
      
      <ContactAccount 
        isTerminalMode={isTerminalMode} 
        onCopyToast={() => handleTriggerToast("복사되었습니다.")}
      />

      <GuestPhotoUpload 
        isTerminalMode={isTerminalMode}
       />
      
      <Guestbook 
        isTerminalMode={isTerminalMode} 
        onCopyToast={(msg) => handleTriggerToast(msg)}
      />

      <Rsvp isTerminalMode={isTerminalMode} />

      <Share
        isTerminalMode={isTerminalMode} 
        onCopyToast={() => handleTriggerToast("주소가 복사되었습니다.")}
       />

       {/* 하단 푸터 (신랑/신부 이름 동적 바인딩) */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>소중한 걸음해 주셔서 고맙습니다.</p>
        <span className={styles.copyright}>© {coupleNames.groom} & {coupleNames.bride}</span>
      </footer>

      {/* 개발자 모드 토글 버튼 */}
      {/* <div className={styles.mode}>
        <button className={styles.cliToggleBtn} onClick={toggleTerminalMode}>
          <span>{isTerminalMode ? "> DEV_MODE" : "> USER"}</span>
        </button>
      </div> */}
      
      <Toast text={toastMessage} showToast={showToast} />
    </div>
  );
}