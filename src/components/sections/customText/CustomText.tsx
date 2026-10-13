"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import styles from "./CustomText.module.scss";
import TerminalCustomText from "@/components/developer/TerminalCustomText/TerminalCustomText";

interface CustomTextProps {
  isTerminalMode: boolean;
  title?: string;
  content?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 12, 
    filter: "blur(3px)" 
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

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
        <motion.div
          className={styles.normalContainer}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className={styles.textWrapper}>
            <motion.span className={styles.quoteMark} variants={itemVariants}>
              “
            </motion.span>

            {title && (
              <motion.p className={styles.verseText} variants={itemVariants}>
                {renderWithLineBreaks(title)}
              </motion.p>
            )}

            {content && (
              <motion.p className={styles.verseRef} variants={itemVariants}>
                {renderWithLineBreaks(content)}
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </section>
  );
}