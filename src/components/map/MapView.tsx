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
  lat?: number | null;
  lng?: number | null;
  onCopySuccess?: () => void;
}

export default function MapView({
  locationName,
  address,
  lat,
  lng,
  onCopySuccess,
}: MapViewProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const testMode = true;

  // 네이버 지도 SDK 초기화 (lat 또는 lng가 유효하지 않으면 API 호출하지 않음)
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

  // 검색 타겟 키워드 (주소 우선, 없으면 장소명)
  const searchQuery = encodeURIComponent(address || locationName);

  // 1. 네이버 지도: 통합 검색 딥링크
  const naverMapUrl = `https://map.naver.com/p/search/${searchQuery}`;

  // 2. 카카오맵: 통합 검색 딥링크
  const kakaoMapUrl = `https://map.kakao.com/link/search/${searchQuery}`;

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

      {/* 지도 앱 바로가기 버튼 */}
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