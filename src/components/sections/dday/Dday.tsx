"use client";

import { useState, useEffect, useRef } from "react";
import data from "@/data/mock.json";
import styles from "./Dday.module.scss";

interface DdayProps {
  isTerminalMode: boolean;
}

export default function Dday({ isTerminalMode }: DdayProps) {
  const { weddingDate, groom, bride } = data;

  // 타이머 및 디데이 초기화
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isAfter: false,
    isToday: false,
  });

  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // 날짜 데이터 파싱
  const targetDateObj = new Date(weddingDate);
  const year = targetDateObj.getFullYear();
  const month = targetDateObj.getMonth();
  const weddingDay = targetDateObj.getDate();
  const formattedMonth = `${year}. ${String(month + 1).padStart(2, "0")}`;

  // 스크롤 진입 감지
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
      { threshold: 0.4 }
    );

    observer.observe(currentRef);

    const rect = currentRef.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom >= 0) {
      setHasAnimated(true);
      observer.disconnect();
    }

    return () => observer.disconnect();
  }, [isTerminalMode]);

  // 실시간 타이머 및 당일/지남/남음 계산 로직
  useEffect(() => {
    const targetTime = new Date(weddingDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      
      // 연, 월, 일을 기준으로 '오늘'인지 판별하기 위한 객체 생성
      const nowDateObj = new Date();
      const isSameDay = 
        nowDateObj.getFullYear() === year &&
        nowDateObj.getMonth() === month &&
        nowDateObj.getDate() === weddingDay;

      if (isSameDay) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isAfter: false, isToday: true });
        return;
      }

      // 이미 예식일이 지난 경우
      if (now > targetTime) {
        const passedDiff = now - targetTime;
        const days = Math.floor(passedDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((passedDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((passedDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((passedDiff % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isAfter: true, isToday: false });
        return;
      }

      // 예식일이 남은 경우
      const difference = targetTime - now;
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isAfter: false, isToday: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [weddingDate, year, month, weddingDay]);

  // 대한민국 고정 공휴일 체크 함수
  const isHoliday = (y: number, m: number, d: number) => {
    const mStr = String(m + 1).padStart(2, "0");
    const dStr = String(d).padStart(2, "0");
    const mmdd = `${mStr}-${dStr}`;

    const fixedHolidays = [
      "01-01", "03-01", "05-05", "06-06", 
      "08-15", "10-03", "10-09", "12-25"
    ];

    return fixedHolidays.includes(mmdd);
  };

  // 달력 배열 만들기
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const calendarDays = [];
  
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    const currentDayOfWeek = new Date(year, month, i).getDay();
    const holidayCheck = isHoliday(year, month, i);
    calendarDays.push({
      day: i,
      isSun: currentDayOfWeek === 0,
      isSat: currentDayOfWeek === 6,
      isHoliday: holidayCheck,
    });
  }
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <section ref={sectionRef} className={styles.ddaySection}>
      {!isTerminalMode && (
        <div className={`${styles.normalContainer} ${hasAnimated ? styles.visible : ""}`}>
          <div className={styles.headerTag}>WEDDING DAY</div>

          {/* 미니 달력 */}
          <div className={styles.calendarBox}>
            <div className={styles.calendarHeader}>
              <span>{formattedMonth}</span>
            </div>
            <div className={styles.weekGrid}>
              {weekDays.map((day, idx) => (
                <span key={idx} className={`${styles.weekDay} ${idx === 0 ? styles.sun : idx === 6 ? styles.sat : ""}`}>
                  {day}
                </span>
              ))}
            </div>
            <div className={styles.daysGrid}>
              {calendarDays.map((item, idx) => {
                if (!item) return <div key={idx} className={styles.dayCell} />;
                
                const isRed = item.isSun || item.isHoliday;
                const isWedding = item.day === weddingDay;

                return (
                  <div 
                    key={idx} 
                    className={`
                      ${styles.dayCell} 
                      ${isRed ? styles.redDay : ""} 
                      ${item.isSat ? styles.satDay : ""} 
                      ${isWedding ? styles.weddingDay : ""}
                    `}
                  >
                    {item.day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 타이머 영역 (당일인 경우 D-DAY 강조 문구 표시) */}
          {timeLeft.isToday ? (
            <div className={styles.countdownWrapper}>
              <div className={styles.timeUnit}>
                <span className={styles.number}>D-DAY</span>
                <span className={styles.label}>TODAY IS THE DAY</span>
              </div>
            </div>
          ) : (
            <div className={styles.countdownWrapper}>
              <div className={styles.timeUnit}>
                <span className={styles.number}>{timeLeft.days}</span>
                <span className={styles.label}>{timeLeft.isAfter ? "DAYS PASSED" : "DAYS"}</span>
              </div>
              <span className={styles.divider}>·</span>
              <div className={styles.timeUnit}>
                <span className={styles.number}>{String(timeLeft.hours).padStart(2, "0")}</span>
                <span className={styles.label}>HOURS</span>
              </div>
              <span className={styles.divider}>·</span>
              <div className={styles.timeUnit}>
                <span className={styles.number}>{String(timeLeft.minutes).padStart(2, "0")}</span>
                <span className={styles.label}>MIN</span>
              </div>
              <span className={styles.divider}>·</span>
              <div className={styles.timeUnit}>
                <span className={styles.number}>{String(timeLeft.seconds).padStart(2, "0")}</span>
                <span className={styles.label}>SEC</span>
              </div>
            </div>
          )}

          {/* 하단 메시지 (당일 / 지난 후 / 남은 날 분기) */}
          {timeLeft.isToday ? (
            <p className={styles.subMessage}>
              오늘, <span className={styles.namesHighlight}>{groom.name} & {bride.name}</span> 의 소중한 결혼식이 열립니다.
            </p>
          ) : timeLeft.isAfter ? (
            <p className={styles.subMessage}>
              <span className={styles.namesHighlight}>{groom.name} & {bride.name}</span> 의 결혼식으로부터 <span className={styles.highlight}>{timeLeft.days}일째</span> 함께하고 있습니다.
            </p>
          ) : (
            <p className={styles.subMessage}>
              <span className={styles.namesHighlight}>{groom.name} & {bride.name}</span> 의 결혼식이 <span className={styles.highlight}>{timeLeft.days}일</span> 남았습니다.
            </p>
          )}
        </div>
      )}

      {/* 개발자 모드 */}
      {isTerminalMode && (
        <div className={styles.terminalContainer}>
          <span className={styles.todo}>// TODO: 개발자 모드는 추후 필요할 때 구현</span>
        </div>
      )}
    </section>
  );
}