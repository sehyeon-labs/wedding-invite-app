"use client";

import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./Dday.module.scss";
import TerminalDday from "@/components/developer/TerminalDday/TerminalDday";

interface DdayProps {
  isTerminalMode: boolean;
}

interface DdayWeddingInfo {
  weddingDate: string;
  groomName: string;
  brideName: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isAfter: boolean;
  isToday: boolean;
}

// 1. 달력 묶음 애니메이션
const calendarGroupVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// 2. 타이머 묶음 애니메이션
const timerGroupVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.05,
    },
  },
};

const timerItemVariants: Variants = {
  hidden: { opacity: 0, y: 15, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Dday({ isTerminalMode }: DdayProps) {
  const [weddingInfo, setWeddingInfo] = useState<DdayWeddingInfo | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isAfter: false,
    isToday: false,
  });

  useEffect(() => {
    async function fetchDdayData() {
      try {
        const { data: weddingData, error: weddingError } = await supabase
          .from("weddings")
          .select("id, wedding_date")
          .limit(1)
          .single();

        if (weddingError) throw weddingError;

        const { data: familyData, error: familyError } = await supabase
          .from("wedding_family_members")
          .select("name, role_type")
          .eq("wedding_id", weddingData.id);

        if (familyError) throw familyError;

        const groom = familyData?.find((m) => m.role_type === "groom");
        const bride = familyData?.find((m) => m.role_type === "bride");

        setWeddingInfo({
          weddingDate: weddingData.wedding_date,
          groomName: groom?.name || "신랑",
          brideName: bride?.name || "신부",
        });
      } catch (error) {
        console.error("D-day 데이터 로드 실패:", error);
      }
    }

    fetchDdayData();
  }, []);

  const targetDateObj = weddingInfo ? new Date(weddingInfo.weddingDate) : new Date();
  const year = targetDateObj.getFullYear();
  const month = targetDateObj.getMonth();
  const weddingDay = targetDateObj.getDate();
  const formattedMonth = `${year}. ${String(month + 1).padStart(2, "0")}`;

  useEffect(() => {
    if (!weddingInfo) return;

    const targetTime = new Date(weddingInfo.weddingDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const nowDateObj = new Date();

      const isSameDay =
        nowDateObj.getFullYear() === year &&
        nowDateObj.getMonth() === month &&
        nowDateObj.getDate() === weddingDay;

      if (isSameDay) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isAfter: false, isToday: true });
        return;
      }

      if (now > targetTime) {
        const passedDiff = now - targetTime;
        const days = Math.floor(passedDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((passedDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((passedDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((passedDiff % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isAfter: true, isToday: false });
        return;
      }

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
  }, [weddingInfo, year, month, weddingDay]);

  const isHoliday = (m: number, d: number) => {
    const mStr = String(m + 1).padStart(2, "0");
    const dStr = String(d).padStart(2, "0");
    const mmdd = `${mStr}-${dStr}`;

    const fixedHolidays = [
      "01-01", "03-01", "05-05", "06-06",
      "08-15", "10-03", "10-09", "10-04", "10-11", "12-25"
    ];

    return fixedHolidays.includes(mmdd);
  };

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const calendarDays = [];

  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    const currentDayOfWeek = new Date(year, month, i).getDay();
    calendarDays.push({
      day: i,
      isSun: currentDayOfWeek === 0,
      isSat: currentDayOfWeek === 6,
      isHoliday: isHoliday(month, i),
    });
  }
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <section className={styles.ddaySection}>
      {isTerminalMode ? (
        <TerminalDday />
      ) : (
        weddingInfo && (
          <div className={styles.normalContainer}>
            {/* 1단계: 달력 섹션 독립 트리거 */}
            <motion.div
              className={styles.calendarSectionWrapper}
              variants={calendarGroupVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                margin: "0px 0px -80px 0px",
                amount: 0.25,
              }}
            >
              <div className={styles.headerTag}>WEDDING DAY</div>

              <div className={styles.calendarBox}>
                <div className={styles.calendarHeader}>
                  <span>{formattedMonth}</span>
                </div>
                <div className={styles.weekGrid}>
                  {weekDays.map((day, idx) => (
                    <span
                      key={idx}
                      className={`${styles.weekDay} ${
                        idx === 0 ? styles.sun : idx === 6 ? styles.sat : ""
                      }`}
                    >
                      {day}
                    </span>
                  ))}
                </div>
                <div className={styles.daysGrid}>
                  {calendarDays.map((item, idx) => {
                    if (!item) return <div key={idx} className={styles.dayCell} />;

                    const isRed = item.isSun || item.isHoliday;
                    const isBlue = item.isSat && !item.isHoliday;
                    const isWedding = item.day === weddingDay;

                    return (
                      <div
                        key={idx}
                        className={`
                          ${styles.dayCell} 
                          ${isRed ? styles.redDay : ""} 
                          ${isBlue ? styles.satDay : ""} 
                          ${isWedding ? styles.weddingDay : ""}
                        `}
                      >
                        {item.day}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* 2단계: 타이머 및 메시지 독립 트리거 (스크롤이 더 도달했을 때 실행) */}
            <motion.div
              className={styles.timerSectionWrapper}
              variants={timerGroupVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                margin: "0px 0px -70px 0px",
                amount: 0.3,
              }}
            >
              <motion.div className={styles.countdownWrapper} variants={timerItemVariants}>
                {timeLeft.isToday ? (
                  <div className={styles.timeUnit}>
                    <span className={styles.number}>D-DAY</span>
                    <span className={styles.label}>TODAY IS THE DAY</span>
                  </div>
                ) : (
                  <>
                    <div className={styles.timeUnit}>
                      <span className={styles.number}>{timeLeft.days}</span>
                      <span className={styles.label}>{timeLeft.isAfter ? "DAYS PASSED" : "DAYS"}</span>
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
                  </>
                )}
              </motion.div>

              <motion.div className={styles.messageBox} variants={timerItemVariants}>
                {timeLeft.isToday ? (
                  <p className={styles.subMessage}>
                    오늘, <span className={styles.namesHighlight}>{weddingInfo.groomName} & {weddingInfo.brideName}</span> 의 소중한 결혼식이 열립니다.
                  </p>
                ) : timeLeft.isAfter ? (
                  <p className={styles.subMessage}>
                    <span className={styles.namesHighlight}>{weddingInfo.groomName} & {weddingInfo.brideName}</span> 의 결혼식으로부터{" "}
                    <span className={styles.highlight}>{timeLeft.days}일째</span> 함께하고 있습니다.
                  </p>
                ) : (
                  <p className={styles.subMessage}>
                    <span className={styles.namesHighlight}>{weddingInfo.groomName} & {weddingInfo.brideName}</span> 의 결혼식이{" "}
                    <span className={styles.highlight}>{timeLeft.days}일</span> 남았습니다.
                  </p>
                )}
              </motion.div>
            </motion.div>
          </div>
        )
      )}
    </section>
  );
}