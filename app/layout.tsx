// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import styles from "./layout.module.scss";
import { supabase } from "@/lib/supabase"; // 서버에서도 읽을 수 있도록 Supabase 클라이언트 임포트

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    // 1. 웨딩 기본 정보 조회
    const { data: weddingData } = await supabase
      .from("weddings")
      .select("id, wedding_date, location_name")
      .limit(1)
      .maybeSingle();

    let groomName = "신랑";
    let brideName = "신부";
    let coverImageUrl = "https://sehyeon-labs.github.io/wedding-invite-app/public/images/tomato.jpeg"; // 기본 fallback 이미지

    if (weddingData) {
      // 신랑 / 신부 이름 조회
      const { data: familyData } = await supabase
        .from("wedding_family_members")
        .select("role_type, name")
        .eq("wedding_id", weddingData.id)
        .in("role_type", ["groom", "bride"]);

      if (familyData) {
        groomName = familyData.find((m) => m.role_type === "groom")?.name || groomName;
        brideName = familyData.find((m) => m.role_type === "bride")?.name || brideName;
      }
    }

    // Storage에서 대표 사진(main 폴더의 첫 번째 이미지) 가져오기
    const storageRef = supabase.storage.from("photos");
    const { data: fileList } = await storageRef.list("main", {
      limit: 5,
      sortBy: { column: "name", order: "asc" },
    });

    if (fileList && fileList.length > 0) {
      const validFiles = fileList.filter((file) => file.name !== ".emptyFolderPlaceholder");
      if (validFiles.length > 0) {
        const { data: publicUrlData } = storageRef.getPublicUrl(`main/${validFiles[0].name}`);
        if (publicUrlData?.publicUrl) {
          coverImageUrl = publicUrlData.publicUrl;
        }
      }
    }

    const title = `${groomName} & ${brideName} 결혼합니다`;
    const description = "소중한 분들을 초대합니다. 함께 축복해 주세요.";

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
            alt: `${groomName} & ${brideName} 웨딩 사진`,
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
    // 에러 발생 시 기본 메타데이터 반환
    return {
      title: "모바일 청첩장",
      description: "소중한 분들을 초대합니다.",
    };
  }
}

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
          href="https://fonts.googleapis.com/css2?family=Gaegu&family=Hi+Melody&family=Gowun+Batang:wght@400;700&family=JetBrains+Mono:wght@400;500;700&family=Nanum+Gothic+Coding:wght@400;700&family=Amatic+SC:wght@400;700&family=Schoolbell&display=swap"
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