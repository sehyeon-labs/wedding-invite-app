// src/app/page.tsx
import Cover from "@/components/sections/cover/Cover";
import Dday from "@/components/sections/dday/Dday";
import Gallery from "@/components/sections/gallery/Gallery";
import styles from "./page.module.scss";

export default function Page() {
  return (
    <div className={styles.container}>
      <section className={styles.section}><Cover /></section>
      <section className={styles.section}><Dday /></section>
      <section className={styles.section}><Gallery /></section>
    </div>
  );
}