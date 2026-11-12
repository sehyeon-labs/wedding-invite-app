"use client";

import { motion } from "framer-motion";
import { itemVariants } from "@/utils/motion";
import styles from "./SectionHeader.module.scss";

interface SectionHeaderProps {
  tag: string;
  title?: string;
}

/** 섹션 상단 영문 태그 + 한글 타이틀 (부모 motion 컨테이너의 variants 애니메이션을 따름) */
export default function SectionHeader({ tag, title }: SectionHeaderProps) {
  return (
    <>
      <motion.div className={styles.tag} variants={itemVariants}>
        {tag}
      </motion.div>
      {title && (
        <motion.h2 className={styles.title} variants={itemVariants}>
          {title}
        </motion.h2>
      )}
    </>
  );
}
