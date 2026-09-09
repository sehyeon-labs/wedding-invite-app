// src/components/sections/Dday.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import data from "@/data/mock.json";
import styles from "./Dday.module.scss";

export default function Dday() {
  const { weddingDate, groom, bride } = data;

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isAfter: false,
  });

  // 애니메이션 및 타이핑 상태
  const [hasAnimated, setHasAnimated] = useState(false);
  const [step, setStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  // 날짜 데이터 파싱
  const targetDateObj = new Date(weddingDate);
  const year = targetDateObj.getFullYear();
  const month = targetDateObj.getMonth(); // 0~11
  const weddingDay = targetDateObj.getDate();

  // 타이핑할 텍스트 정의
  const headerText = `// TIME_TO_WEDDING.tsx`;
  const headerMonthText = `${year}. ${String(month + 1).padStart(2, "0")}`;
  const subMessageText = `${groom.name} & ${bride.name}의 결혼식이 ${timeLeft.days}일 남았습니다.`;

  // 타이핑된 문자열 상태
  const [typedTitle, setTypedTitle] = useState("");
  const [typedMonth, setTypedMonth] = useState("");
  const [typedSub, setTypedSub] = useState("");

  // 1. 스크롤 진입 감지 (단 1번만 실행되도록 체크)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true); // 👈 진입 즉시 잠금 처리하여 다시 리셋되지 않게 함
          setStep(1); // 1단계 시작
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  // 2. 순차적 타이핑 효과 제어 (한 번 실행되면 끝)
  useEffect(() => {
    if (!hasAnimated) return;

    if (step === 1) {
      let i = 0;
      const timer = setInterval(() => {
        if (i <= headerText.length) {
          setTypedTitle(headerText.slice(0, i));
          i++;
        } else {
          clearInterval(timer);
          setStep(2);
        }
      }, 60);
      return () => clearInterval(timer);
    }

    if (step === 2) {
      let i = 0;
      const timer = setInterval(() => {
        if (i <= headerMonthText.length) {
          setTypedMonth(headerMonthText.slice(0, i));
          i++;
        } else {
          clearInterval(timer);
          setStep(3);
        }
      }, 120);
      return () => clearInterval(timer);
    }

    if (step === 3) {
      let i = 0;
      const timer = setInterval(() => {
        if (i <= subMessageText.length) {
          setTypedSub(subMessageText.slice(0, i));
          i++;
        } else {
          clearInterval(timer);
          setStep(4);
        }
      }, 80);
      return () => clearInterval(timer);
    }
  }, [hasAnimated, step, headerText, headerMonthText, subMessageText]);

  // 3. 실시간 카운트다운 타이머
  useEffect(() => {
    const targetTime = new Date(weddingDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isAfter: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isAfter: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [weddingDate]);

  // 달력 배열 만들기
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push(i);
  }
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <section ref={sectionRef} className={styles.ddaySection}>
      {/* hasAnimated가 true가 되면 항상 visible 클래스를 유지하여 사라지지 않음 */}
      <div className={`${styles.container} ${hasAnimated ? styles.visible : ""}`}>
        {/* 상단 타이핑 태그 */}
        <div className={styles.headerTag}>
          <span>{hasAnimated ? typedTitle : ""}</span>
          {step === 1 && <span className={styles.cursor}>_</span>}
        </div>

        {/* 미니 달력 */}
        <div className={`${styles.calendarBox} ${hasAnimated && step >= 2 ? styles.showCalendar : ""}`}>
          <div className={styles.calendarHeader}>
            <span>{hasAnimated ? typedMonth : ""}</span>
            {step === 2 && <span className={styles.cursor}>_</span>}
          </div>
          <div className={styles.weekGrid}>
            {weekDays.map((day, idx) => (
              <span key={idx} className={styles.weekDay}>{day}</span>
            ))}
          </div>
          <div className={styles.daysGrid}>
            {calendarDays.map((day, idx) => (
              <div 
                key={idx} 
                className={`${styles.dayCell} ${day === weddingDay ? styles.weddingDay : ""}`}
              >
                {day !== null ? day : ""}
              </div>
            ))}
          </div>
        </div>

        {/* 카운트다운 타이머 */}
        {timeLeft.isAfter ? (
          <p className={styles.passedText}>두 사람이 함께 한 지 어느덧 시간이 흘렀습니다.</p>
        ) : (
          <div className={`${styles.countdownWrapper} ${hasAnimated && step >= 2 ? styles.showTimer : ""}`}>
            <div className={styles.timeUnit}>
              <span className={styles.number}>{timeLeft.days}</span>
              <span className={styles.label}>DAYS</span>
            </div>
            <span className={styles.divider}>:</span>
            <div className={styles.timeUnit}>
              <span className={styles.number}>{String(timeLeft.hours).padStart(2, "0")}</span>
              <span className={styles.label}>HOURS</span>
            </div>
            <span className={styles.divider}>:</span>
            <div className={styles.timeUnit}>
              <span className={styles.number}>{String(timeLeft.minutes).padStart(2, "0")}</span>
              <span className={styles.label}>MIN</span>
            </div>
            <span className={styles.divider}>:</span>
            <div className={styles.timeUnit}>
              <span className={styles.number}>{String(timeLeft.seconds).padStart(2, "0")}</span>
              <span className={styles.label}>SEC</span>
            </div>
          </div>
        )}

        {/* 하단 설명 문구 타이핑 (완료 후에도 step >= 3 이므로 커서 깜빡임 유지) */}
        <p className={styles.subMessage}>
          <span>{hasAnimated ? typedSub : ""}</span>
          {hasAnimated && <span className={styles.cursor}>_</span>}
        </p>
      </div>
    </section>
  );
}