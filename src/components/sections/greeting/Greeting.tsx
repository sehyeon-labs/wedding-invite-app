// src/components/sections/Greeting.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import data from "@/data/mock.json";
import styles from "./Greeting.module.scss";

export default function Greeting() {
  const { groom, bride, greeting } = data;
  const [hasAnimated, setHasAnimated] = useState(false);
  const [step, setStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const subTitleText = "> cat greeting.txt";
  const [typedSubTitle, setTypedSubTitle] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          setStep(1);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    if (step === 1) {
      let i = 0;
      const timer = setInterval(() => {
        if (i <= subTitleText.length) {
          setTypedSubTitle(subTitleText.slice(0, i));
          i++;
        } else {
          clearInterval(timer);
          setStep(2);
          
          setTimeout(() => {
            setStep(3);
          }, 600);
        }
      }, 80);
      return () => clearInterval(timer);
    }
  }, [hasAnimated, step, subTitleText]);

  const renderParentName = (parent: { name: string; isDeceased?: boolean } | null) => {
    if (!parent) return null;
    return (
      <span>
        {parent.isDeceased && <span className={styles.deceasedMark}>故 </span>}
        {parent.name}
      </span>
    );
  };

  const renderParentsElements = (father: any, mother: any) => {
    const elements = [];
    if (father) elements.push(<span key="father">{renderParentName(father)}</span>);
    if (mother) {
      if (elements.length > 0) elements.push(<span key="dot"> · </span>);
      elements.push(<span key="mother">{renderParentName(mother)}</span>);
    }
    return elements;
  };

  return (
    <section ref={sectionRef} className={styles.greetingSection}>
      <div className={`${styles.container} ${hasAnimated ? styles.visible : ""}`}>
        
        <div className={styles.headerTag}>
          <span>{hasAnimated ? typedSubTitle : ""}</span>
          {hasAnimated && <span className={styles.cursor}>_</span>}
        </div>

        <div className={`${styles.contentWrapper} ${hasAnimated && step >= 3 ? styles.showContent : ""}`}>
          <h2 className={styles.title}>{greeting.title}</h2>
          <p className={styles.content}>{greeting.content}</p>

          <div className={styles.namesContainer}>
            {/* 신랑 측 */}
            <div className={styles.nameRow}>
              <span className={styles.parents}>
                {renderParentsElements(groom.father, groom.mother)}
              </span>
              <span className={styles.relation}>의 {groom.relation || "장남"}</span>
              <span className={styles.name}>{groom.name}</span>
            </div>

            {/* 신부 측 */}
            <div className={styles.nameRow}>
              <span className={styles.parents}>
                {renderParentsElements(bride.father, bride.mother)}
              </span>
              <span className={styles.relation}>의 {bride.relation || "차녀"}</span>
              <span className={styles.name}>{bride.name}</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}