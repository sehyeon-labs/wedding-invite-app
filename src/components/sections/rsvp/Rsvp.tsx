// src/components/sections/Rsvp.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Rsvp.module.scss";

export default function Rsvp() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [step, setStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const subTitleText = "> cat rsvp.sh";
  const [typedSubTitle, setTypedSubTitle] = useState("");

  // 폼 입력 상태
  const [formData, setFormData] = useState({
    name: "",
    side: "groom", // groom (신랑측) | bride (신부측)
    attendance: "yes", // yes (참석) | no (불참)
    meal: "yes", // yes (식사함) | no (식사안함)
    guestCount: "1",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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
          setTimeout(() => setStep(3), 600);
        }
      }, 90);
      return () => clearInterval(timer);
    }
  }, [hasAnimated, step, subTitleText]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("성함을 입력해주세요.");
      return;
    }

    setLoading(true);
    // TODO: 백엔드나 구글 스프레드시트 API 연동 지점
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={`${styles.container} ${hasAnimated ? styles.visible : ""}`}>
        
        {/* 타이핑 헤더 */}
        <div className={styles.headerTag}>
          <span>{hasAnimated ? typedSubTitle : ""}</span>
          {hasAnimated && <span className={styles.cursor}>_</span>}
        </div>

        <div className={`${styles.contentWrapper} ${hasAnimated && step >= 3 ? styles.showContent : ""}`}>
          
          <h2 className={styles.mainTitle}>참석 의사 전달</h2>
          <p className={styles.subDescription}>
            소중한 발걸음을 해주시는 모든 분들을 위해<br />
            정성껏 식사를 준비할 수 있도록 미리 알려주세요.
          </p>

          {!submitted ? (
            <form className={styles.terminalForm} onSubmit={handleSubmit}>
              <div className={styles.formHeader}>
                <span className={styles.configHeader}>// RSVP_INPUT_CONFIG</span>
              </div>

              {/* 구분 (신랑측 / 신부측) */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>$ select side</label>
                <div className={styles.radioGroup}>
                  <button
                    type="button"
                    className={`${styles.radioBtn} ${formData.side === "groom" ? styles.active : ""}`}
                    onClick={() => setFormData({ ...formData, side: "groom" })}
                  >
                    신랑 측
                  </button>
                  <button
                    type="button"
                    className={`${styles.radioBtn} ${formData.side === "bride" ? styles.active : ""}`}
                    onClick={() => setFormData({ ...formData, side: "bride" })}
                  >
                    신부 측
                  </button>
                </div>
              </div>

              {/* 성함 입력 */}
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="name">$ input name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={styles.textInput}
                  placeholder="성함을 입력하세요"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* 참석 여부 */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>$ attendance</label>
                <div className={styles.radioGroup}>
                  <button
                    type="button"
                    className={`${styles.radioBtn} ${formData.attendance === "yes" ? styles.active : ""}`}
                    onClick={() => setFormData({ ...formData, attendance: "yes" })}
                  >
                    참석합니다
                  </button>
                  <button
                    type="button"
                    className={`${styles.radioBtn} ${formData.attendance === "no" ? styles.active : ""}`}
                    onClick={() => setFormData({ ...formData, attendance: "no" })}
                  >
                    정중히 사절합니다
                  </button>
                </div>
              </div>

              {/* 참석 시 추가 정보 (참석할 경우만 노출) */}
              {formData.attendance === "yes" && (
                <>
                  <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="guestCount">$ guest count</label>
                    <select
                      id="guestCount"
                      name="guestCount"
                      className={styles.selectInput}
                      value={formData.guestCount}
                      onChange={handleChange}
                    >
                      <option value="1">본인 포함 1명</option>
                      <option value="2">본인 포함 2명</option>
                      <option value="3">본인 포함 3명</option>
                      <option value="4">본인 포함 4명</option>
                      <option value="5">본인 포함 5명 이상</option>
                    </select>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>$ meal status</label>
                    <div className={styles.radioGroup}>
                      <button
                        type="button"
                        className={`${styles.radioBtn} ${formData.meal === "yes" ? styles.active : ""}`}
                        onClick={() => setFormData({ ...formData, meal: "yes" })}
                      >
                        식사 예정
                      </button>
                      <button
                        type="button"
                        className={`${styles.radioBtn} ${formData.meal === "no" ? styles.active : ""}`}
                        onClick={() => setFormData({ ...formData, meal: "no" })}
                      >
                        식사 안 함
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? "PROCESSING..." : "EXECUTE RSVP // 전송하기"}
              </button>
            </form>
          ) : (
            <div className={styles.successBox}>
              <span className={styles.successHeader}>// STATUS: SUCCESS (200 OK)</span>
              <p className={styles.successText}>
                참석 의사가 정상적으로 기록되었습니다.<br />
                축하해주셔서 진심으로 감사합니다.
              </p>
              <button 
                className={styles.resetBtn} 
                onClick={() => setSubmitted(false)}
              >
                다시 작성하기
              </button>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}