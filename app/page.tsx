"use client";

import Cover from "@/components/sections/cover/Cover";
import Greeting from "@/components/sections/greeting/Greeting";
import Dday from "@/components/sections/dday/Dday";
import Gallery from "@/components/sections/gallery/Gallery";
import styles from "./page.module.scss";
import ContactAccount from "@/components/sections/contactAccount/ContactAccount";
import Reception from "@/components/sections/reception/Reception";
import Location from "@/components/sections/location/Location";
import Guestbook from "@/components/sections/guestbook/Guestbook";
import Rsvp from "@/components/sections/rsvp/Rsvp";
import GuestPhotoUpload from "@/components/sections/guestPhotoUpload/GuestPhotoUpload";
import { useState, useRef } from "react";
import data from "@/data/mock.json";
import CustomText from "@/components/sections/customText/CustomText";

export default function Page() {
  const { greeting } = data;
  const [isTerminalMode, setIsTerminalMode] = useState(false);
  const [isLoaderActive, setIsLoaderActive] = useState(false);
  
  const [showToast, setShowToast] = useState(false);

  const hasLoadedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleTerminalMode = () => {
    setIsTerminalMode((prev) => {
      const nextMode = !prev;
      if (nextMode && !hasLoadedRef.current) {
        if (containerRef.current) {
          containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
      return nextMode;
    });
  };

  const handleTriggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div 
      ref={containerRef} 
      className={`${styles.container} ${isLoaderActive ? styles.lockScroll : ""}`}
    >
      {/* Developer Toggle Button */}
      <button className={styles.cliToggleBtn} onClick={toggleTerminalMode}>
        &gt; CLI_MODE
      </button>

      {/* Sections */}
      <Cover 
        isTerminalMode={isTerminalMode}
        hasLoadedRef={hasLoadedRef}
        onLoadingChange={setIsLoaderActive}
      />
      
      <CustomText
        isTerminalMode={isTerminalMode}
        title={greeting.bibleVerse.verse}
        content={greeting.bibleVerse.reference}
      />

      <Dday 
        isTerminalMode={isTerminalMode}
      />

      <Greeting 
        isTerminalMode={isTerminalMode} 
      />

      <Gallery 
        isTerminalMode={isTerminalMode} 
      />

      <GuestPhotoUpload 
        isTerminalMode={isTerminalMode} 
      />

      <Guestbook 
        isTerminalMode={isTerminalMode} 
      />

      <Location 
        isTerminalMode={isTerminalMode}
        onCopyToast={handleTriggerToast}
      />

      <Reception 
        isTerminalMode={isTerminalMode} 
        onCopyToast={handleTriggerToast}
      />

     <ContactAccount 
        isTerminalMode={isTerminalMode} 
        onCopyToast={handleTriggerToast}
      />

      <Rsvp 
        isTerminalMode={isTerminalMode} 
      />

      {/* Toast Message */}
      <div className={`${styles.globalToast} ${showToast ? styles.show : ""}`}>
        복사되었습니다.
      </div>
    </div>
  );
}