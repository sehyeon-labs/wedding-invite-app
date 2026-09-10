// src/components/map/MapView.tsx
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
}

export default function MapView({ locationName, address, lat, lng }: MapViewProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);
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
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    });
  };

  return (
    <div className={styles.mapViewerWrapper}>
      <div className={styles.terminalBlock}>
        <div className={styles.blockHeader}>
          <div className={styles.dots}>
            <span className={styles.dotRed} />
            <span className={styles.dotYellow} />
            <span className={styles.dotGreen} />
          </div>
        </div>

        {/* 💡 지도가 로드되지 않았거나 API 키가 없을 때 보여줄 터미널 감성 대체 화면 */}
        <div id="map" className={styles.mapScreen}>
          {!isMapLoaded && (
            <div style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.7rem', color: '#6a737d' }}>
              {`// MAP_LOADING_OR_OFFLINE\n// location: ${locationName || 'Unknown'}\n// lat: ${lat}, lng: ${lng}`}
            </div>
          )}
        </div>
      </div>

      {address && (
        <div className={styles.addressRow}>
          <span className={styles.addressText}>{address}</span>
          <button 
            className={styles.copyBtn} 
            onClick={() => handleCopyAddress(address)}
          >
            {copiedAddress ? "복사완료!" : "주소복사"}
          </button>
        </div>
      )}

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