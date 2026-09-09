// src/app/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Cover from "@/components/sections/cover/Cover";
import Greeting from "@/components/sections/greeting/Greeting";
import Dday from "@/components/sections/dday/Dday";
import Gallery from "@/components/sections/gallery/Gallery";
import QuickNav from "@/components/common/quickNav/QuickNav";
import styles from "./page.module.scss";
import ContactAccount from "@/components/sections/contactAccount/ContactAccount";
import Prayer from "@/components/sections/prayer/Prayer";

export default function Page() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  // IntersectionObserver로 현재 보이는 섹션 감지
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-40% 0px -40% 0px",
      threshold: 0,
    };

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = sectionRefs.current.indexOf(entry.target as HTMLElement);
          if (index !== -1) {
            setActiveIndex(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavSelect = (index: number) => {
    setActiveIndex(index);
    sectionRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={styles.container}>
      <QuickNav 
        totalSections={6} 
        activeIndex={activeIndex} 
        isVisible={activeIndex > 0} 
        onSelect={handleNavSelect} 
      />

      <section ref={(el) => { sectionRefs.current[0] = el; }} className={styles.section}>
        <Cover />
      </section>
      
      <section ref={(el) => { sectionRefs.current[1] = el; }} className={styles.section}>
        <Greeting />
      </section>

      <section ref={(el) => { sectionRefs.current[2] = el; }} className={styles.section}>
        <Dday />
      </section>

      <section ref={(el) => { sectionRefs.current[5] = el; }} className={styles.section}>
        <Prayer />
      </section>

      <section ref={(el) => { sectionRefs.current[3] = el; }} className={styles.section}>
        <Gallery />
      </section>

      <section ref={(el) => { sectionRefs.current[4] = el; }} className={styles.section}>
        <ContactAccount />
      </section>
    </div>
  );
}