// src/app/layout.tsx

import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import styles from "./layout.module.scss";

export const metadata: Metadata = {
  title: "준구 & 세현 결혼식에 초대합니다",
  description: "2026년 O월 O일 토요일 오후 X시, OOO 웨딩홀",
  openGraph: {
    title: "준구 & 세현 결혼식에 초대합니다",
    description: "2026년 O월 O일 토요일 오후 X시, OOO 웨딩홀",
    images: [
      {
        url: "https://hyeon0114.github.io/wedding-invite-app/images/tomato.jpeg", 
        width: 800,
        height: 600,
        alt: "웨딩 대표 사진",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const naverClientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;

  return (
    <html lang="ko">
      <head>
        {/* 구글 폰트 프리로드 및 로드 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Gaegu&family=Hi+Melody&family=Gowun+Batang:wght@400;700&family=JetBrains+Mono:wght@400;500;700&family=Nanum+Gothic+Coding:wght@400;700&family=Amatic+SC:wght@400;700&family=Schoolbell&display=swap"
          rel="stylesheet"
        />
        {/* 네이버 지도 API 스크립트 */}
        <Script
          type="text/javascript"
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverClientId}`}
          strategy="beforeInteractive"
        />
      </head>

      {/* Body */}
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