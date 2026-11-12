import type { Variants } from "framer-motion";

/** 섹션 공통 스태거 컨테이너 애니메이션 */
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

/** 섹션 공통 아이템 페이드업 애니메이션 */
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
};

/** 섹션 whileInView 공통 옵션 */
export const sectionViewport = {
  once: true,
  margin: "0px 0px -80px 0px",
  amount: 0.2,
} as const;
