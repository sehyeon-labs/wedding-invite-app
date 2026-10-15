"use client";

import { motion } from "framer-motion";
import styles from "./TerminalReception.module.scss";

export default function TerminalReception() {
  return (
    <motion.div
      className={styles.terminalContainer}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <span className={styles.todo}>// TODO: 개발자 모드는 추후 필요할 때 구현</span>
    </motion.div>
  );
}