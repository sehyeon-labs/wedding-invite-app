"use client";

import { motion } from "framer-motion";
import React from "react";
import styles from "./CustomText.module.scss";

interface CustomTextProps {
  isTerminalMode: boolean;
  title?: string;
  content?: string;
}

/**
 * 텍스트 내의 \n 기호를 <br /> 태그로 변환하여 렌더링하는 유틸 함수
 */
const renderWithLineBreaks = (text: string) => {
  // 실제 줄바꿈(\n) 혹은 문자열 "\n" (\\n) 모두 처리 가능하도록 정규식 사용
  return text.split(/\\n|\n/).map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));
};

/**
 * 외부에서 타이틀과 텍스트를 전달받아 렌더링하는 범용 텍스트 섹션 컴포넌트
 */
export default function CustomText({ 
  isTerminalMode, 
  title, 
  content 
}: CustomTextProps) {
  return (
    <section className={styles.customTextSection}>
      {/* 일반 모드 */}
      {!isTerminalMode && (
        <motion.div 
          className={styles.normalContainer}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.textWrapper}>
            <span className={styles.quoteMark}>“</span>
            {title && (
              <p className={styles.verseText}>
                {renderWithLineBreaks(title)}
              </p>
            )}
            {content && (
              <p className={styles.verseRef}>
                {renderWithLineBreaks(content)}
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* 개발자 모드 */}
      {isTerminalMode && (
        <motion.div 
          className={styles.terminalContainer}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.todo}>// TODO: 개발자 모드는 추후 필요할 때 구현</span>
        </motion.div>
      )}
    </section>
  );
}