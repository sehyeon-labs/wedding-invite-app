// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import styles from "./layout.module.scss";
import Script from "next/script";

export const metadata: Metadata = {
  title: "준구 & 세현 결혼식에 초대합니다",
  description: "2027년 10월 25일",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" as="style" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v7.0.5/dist/web/static/pretendard.css" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet"></link>
        <link href="https://fonts.googleapis.com/css2?family=Nanum+Gothic+Coding:wght@400;700&display=swap" rel="stylesheet" />
       <Script
          type="text/javascript"
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_CLIENT_ID}`}
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <div className={styles.pcContainer}>
          <div className={styles.mobileFrame}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}