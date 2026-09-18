"use client";

import { useState, useEffect, useRef } from "react";
import data from "@/data/mock.json";
import styles from "./Greeting.module.scss";

interface GreetingProps {
  isTerminalMode: boolean;
}

export default function Greeting({ isTerminalMode }: GreetingProps) {
  const { groom, bride, greeting } = data;

  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasAnimated(false);
    const currentRef = sectionRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(currentRef);

    const rect = currentRef.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom >= 0) {
      setHasAnimated(true);
      observer.disconnect();
    }

    return () => observer.disconnect();
  }, [isTerminalMode]);

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
    <section className={styles.greetingSection}>
      {/* 일반 모드 */}
      {!isTerminalMode && (
        <div ref={sectionRef} className={`${styles.normalContainer} ${hasAnimated ? styles.visible : ""}`}>
          <div className={styles.normalContentWrapper}>
            <span className={styles.quoteMark}>“</span>
            <h2 className={styles.normalTitle}>{greeting.title}</h2>
            <p className={styles.normalContent}>{greeting.content}</p>

            <div className={styles.namesContainer}>
              <div className={styles.nameRow}>
                <span className={styles.parents}>
                  {renderParentsElements(groom.father, groom.mother)}
                </span>
                <span className={styles.relation}>의 {groom.relation || "장남"}</span>
                <span className={styles.name}>{groom.name}</span>
              </div>

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
      )}

      {/* 개발자 모드 */}
      {isTerminalMode && (
        <div ref={sectionRef} className={`${styles.terminalContainer} ${hasAnimated ? styles.visible : ""}`}>
          {/* TODO: 개발자 모드는 추후 필요할 때 구현 */}
          <span className={styles.todo}>// TODO: 개발자 모드는 추후 필요할 때 구현</span>
        </div>
      )}
    </section>
  );
}