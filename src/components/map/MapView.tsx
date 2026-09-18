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
  lat?: number;
  lng?: number;
  onCopySuccess?: () => void;
}

export default function MapView({ locationName, address, lat, lng, onCopySuccess }: MapViewProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (!lat || !lng) return; 

    const initMap = () => {
      if (window.naver && window.naver.maps) {
        try {
          const mapOptions = {
            center: new window.naver.maps.LatLng(lat || 37.5666, lng || 126.9784),
            zoom: 16,
            zoomControl: false,
          };

          const map = new window.naver.maps.Map("map", mapOptions);

          new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(lat || 37.5666, lng || 126.9784),
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
        onCopySuccess(); // 💡 부모의 토스트 실행
      }
    });
  };

  return (
    <div className={styles.mapViewerWrapper}>
      {/* 지도 렌더링 영역 */}
      <div className={styles.mapFrame}>
        <div id="map" className={styles.mapScreen}>
          {!isMapLoaded && (
            <div className={styles.mapLoading}>
              지도를 불러오는 중입니다...
            </div>
          )}
        </div>
      </div>

      {/* 주소 및 복사 버튼 */}
      {address && (
        <div className={styles.addressRow}>
          <span className={styles.addressText}>{address}</span>
          <button 
            className={styles.copyBtn} 
            onClick={() => handleCopyAddress(address)}
          >
            주소복사
          </button>
        </div>
      )}

      {/* 지도 앱 바로가기 버튼 그룹 */}
      {address && (
        <div className={styles.mapBtnGroup}>
          <a href={`https://map.naver.com/v5/search/${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className={styles.mapBtn}>
            네이버 지도
          </a>
          <a href={`https://map.kakao.com/link/search/${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className={styles.mapBtn}>
            카카오맵
          </a>
          <a href={`https://surl.tmobiapi.com/search?keyword=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className={styles.mapBtn}>
            티맵
          </a>
        </div>
      )}
    </div>
  );
}