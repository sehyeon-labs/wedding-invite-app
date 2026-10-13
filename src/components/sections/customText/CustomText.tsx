"use client";

import React from "react";
import styles from "./CustomText.module.scss";
import TerminalCustomText from "@/components/developer/TerminalCustomText/TerminalCustomText";

interface CustomTextProps {
  isTerminalMode: boolean;
  title?: string;
  content?: string;
}

const renderWithLineBreaks = (text: string) => {
  return text.split(/\\n|\n/).map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));
};

export default function CustomText({
  isTerminalMode,
  title,
  content,
}: CustomTextProps) {
  return (
    <section className={styles.customTextSection}>
      {isTerminalMode ? (
        <TerminalCustomText />
      ) : (
        <div className={styles.normalContainer}>
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
        </div>
      )}
    </section>
  );
}