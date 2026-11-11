"use client";

import { useEffect, useState } from "react";
import styles from "./MapView.module.scss";

declare global {
  interface Window {
    naver: any;
  }
}

interface MapViewProps {
  locationName: string;
  address: string;
  naver_address?: string;
  kakao_address?: string;
  lat?: number | null;
  lng?: number | null;
  onCopySuccess?: () => void;
}

export default function MapView({
  locationName,
  address,
  naver_address,
  kakao_address,
  lat,
  lng,
  onCopySuccess,
}: MapViewProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const testMode = false;

  useEffect(() => {
    if (lat === null || lat === undefined || lng === null || lng === undefined) {
      return;
    }

    if (testMode) {
      return;
    }

    const initMap = () => {
      if (window.naver && window.naver.maps) {
        try {
          const mapOptions = {
            center: new window.naver.maps.LatLng(lat, lng),
            zoom: 17,
            zoomControl: false,
            draggable: true,
            pinchZoom: true,
            scrollWheel: false,
          };

          const map = new window.naver.maps.Map("map", mapOptions);

          new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(lat, lng),
            map: map,
          });

          window.naver.maps.Event.trigger(map, "resize");
          setIsMapLoaded(true);
        } catch (e) {
          console.error("Map load error:", e);
        }
      }
    };

    if (window.naver && window.naver.maps) {
      initMap();
    } else {
      const checkInterval = setInterval(() => {
        if (window.naver && window.naver.maps) {
          initMap();
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, [lat, lng]);

  const handleCopyAddress = (targetAddress: string) => {
    navigator.clipboard.writeText(targetAddress).then(() => {
      if (onCopySuccess) {
        onCopySuccess();
      }
    });
  };

  // 네이버 지도 URL 분기 처리
  const getNaverMapUrl = () => {
    if (!naver_address) {
      const fallbackTarget = locationName || address;
      return `https://map.naver.com/p/search/${encodeURIComponent(fallbackTarget)}`;
    }

    // 1. 전체 URL이 들어온 경우 (http:// 또는 https:// 로 시작)
    if (naver_address.startsWith("http://") || naver_address.startsWith("https://")) {
      return naver_address;
    }

    // 2. 숫자만 있는 플레이스 ID 형태인 경우 (예: "38339109")
    if (/^\d+$/.test(naver_address.trim())) {
      return `https://map.naver.com/p/entry/place/${naver_address.trim()}`;
    }

    // 3. 일반 텍스트나 주소 문자열인 경우
    return `https://map.naver.com/p/search/${encodeURIComponent(naver_address)}`;
  };

  const naverMapUrl = getNaverMapUrl();

  // 카카오맵 검색 타겟
  const kakaoQueryTarget = kakao_address || locationName || address;
  const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(kakaoQueryTarget)}`;

  return (
    <div className={styles.mapViewerWrapper}>
      {/* 지도 렌더링 영역 */}
      <div className={styles.mapFrame}>
        <div id="map" className={styles.mapScreen}>
          {!isMapLoaded && (
            <div className={styles.mapLoading}>
              {lat && lng ? "지도를 불러오는 중입니다..." : "지도를 준비 중입니다."}
            </div>
          )}
        </div>
      </div>

      {/* 주소 안내 및 복사 */}
      {address && (
        <div className={styles.addressRow}>
          <span className={styles.addressText}>{address}</span>
          <button
            type="button"
            className={styles.copyBtn}
            onClick={() => handleCopyAddress(address)}
          >
            복사
          </button>
        </div>
      )}

      {/* 지도 바로가기 버튼 */}
      <div className={styles.mapBtnGroup}>
        <a
          href={naverMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mapBtn}
        >
          <span className={styles.btnIconNaver}>N</span>
          <span>네이버 지도</span>
        </a>
        <a
          href={kakaoMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mapBtn}
        >
          <span className={styles.btnIconKakao}>K</span>
          <span>카카오맵</span>
        </a>
      </div>
    </div>
  );
}