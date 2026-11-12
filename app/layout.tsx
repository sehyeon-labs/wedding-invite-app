import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import styles from "./layout.module.scss";
import { fetchShareInfo } from "@/lib/shareInfo";
import { getFirstStorageFileUrl } from "@/lib/supabaseHelpers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

/** 신랑·신부 이름과 대표 사진으로 SEO / 공유 미리보기 메타데이터 생성 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const { title, description, groomName, brideName } = await fetchShareInfo();
    const coverImageUrl =
      (await getFirstStorageFileUrl("main").catch(() => null)) ||
      "https://sehyeon-labs.github.io/wedding-invite-app/public/images/tomato.jpeg";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images: [
          {
            url: coverImageUrl,
            width: 800,
            height: 600,
            alt: `${groomName}와 ${brideName}의 결혼식`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [coverImageUrl],
      },
    };
  } catch (error) {
    console.error("메타데이터 생성 중 에러 발생:", error);
    return {
      title: "모바일 청첩장",
      description: "소중한 분들을 초대합니다.",
    };
  }
}

/** 루트 레이아웃: 폰트/외부 SDK 로드 + 모바일 프레임 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const naverClientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;

  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chiron+GoRound+TC&family=Gaegu&family=Hi+Melody&family=Gowun+Batang:wght@400;700&family=JetBrains+Mono:wght@400;500;700&family=Nanum+Gothic+Coding:wght@400;700&family=Amatic+SC:wght@400;700&family=Schoolbell&display=swap"
          rel="stylesheet"
        />
        {naverClientId && (
          <Script
            src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverClientId}`}
            strategy="afterInteractive"
          />
        )}
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <div className={styles.pcContainer}>
          <main className={styles.mobileFrame}>{children}</main>
        </div>
      </body>
    </html>
  );
}