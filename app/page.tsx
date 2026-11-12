"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./page.module.scss";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";

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
import BackgroundMusic from "@/components/bgm/BackgroundMusic";

interface WeddingVerse {
  verse: string;
  reference: string;
}

/** 모바일 청첩장 메인 페이지: 섹션 조합 + 공통 토스트 관리 */
export default function Page() {
  const [isTerminalMode] = useState(false);
  const [isLoaderActive, setIsLoaderActive] = useState(false);
  const [verseData, setVerseData] = useState<WeddingVerse>({ verse: "", reference: "" });
  const [coupleNames, setCoupleNames] = useState({ groom: "신랑", bride: "신부" });
  
  const { message: toastMessage, visible: showToast, showToast: handleTriggerToast } = useToast();

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    async function fetchPageData() {
      try {
        const [weddingRes, memberRes] = await Promise.all([
          supabase
            .from("weddings")
            .select("bible_verse, bible_reference")
            .limit(1)
            .maybeSingle(),
          supabase
            .from("wedding_family_members")
            .select("role_type, name")
            .in("role_type", ["groom", "bride"])
        ]);

        if (weddingRes.data) {
          setVerseData({
            verse: weddingRes.data.bible_verse || "",
            reference: weddingRes.data.bible_reference || "",
          });
        }

        if (memberRes.data) {
          const groom = memberRes.data.find((m) => m.role_type === "groom")?.name || "신랑";
          const bride = memberRes.data.find((m) => m.role_type === "bride")?.name || "신부";
          setCoupleNames({ groom, bride });
        }
      } catch (error) {
        console.error("데이터 로드 오류:", error);
      }
    }

    fetchPageData();
  }, []);

  return (
    <div className={`${styles.container} ${isLoaderActive ? styles.lockScroll : ""}`}>
      <BackgroundMusic />

      <Cover 
        isTerminalMode={isTerminalMode}
        hasLoadedRef={hasLoadedRef}
        onLoadingChange={setIsLoaderActive}
      />
      
      <Greeting isTerminalMode={isTerminalMode} />

      <Dday isTerminalMode={isTerminalMode} onToast={handleTriggerToast} />

      <CustomText
        isTerminalMode={isTerminalMode}
        title={verseData.verse}
        content={verseData.reference}
      />
      
      <Gallery isTerminalMode={isTerminalMode} />

      <Location 
        isTerminalMode={isTerminalMode}
        onCopyToast={() => handleTriggerToast("주소가 복사되었습니다.")}
      />

      <Rsvp isTerminalMode={isTerminalMode} onToast={handleTriggerToast} />

      <Notice isTerminalMode={isTerminalMode} />

      <Reception 
        isTerminalMode={isTerminalMode} 
        onCopyToast={() => handleTriggerToast("계좌번호가 복사되었습니다.")}
      />
      
      <ContactAccount 
        isTerminalMode={isTerminalMode} 
        onCopyToast={() => handleTriggerToast("복사되었습니다.")}
      />

      <GuestPhotoUpload isTerminalMode={isTerminalMode} onToast={handleTriggerToast} />
      
      <Guestbook isTerminalMode={isTerminalMode} onToast={handleTriggerToast} />

      <Share isTerminalMode={isTerminalMode} onToast={handleTriggerToast} />

      <footer className={styles.footer}>
        <p className={styles.footerText}>소중한 걸음해 주셔서 고맙습니다.</p>
        <span className={styles.copyright}>
          © {coupleNames.groom} & {coupleNames.bride}
        </span>
      </footer>

      <Toast text={toastMessage} showToast={showToast} />
    </div>
  );
}