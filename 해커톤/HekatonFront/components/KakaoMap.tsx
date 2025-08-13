"use client";

import { useEffect, useRef, memo } from "react";
import { useKakaoMap } from "@/contexts/kakao-map-context";
import { OK } from "zod";

// 지도 구현 컴포넌트
//카카오맵 타입 선언 (타입스크립트 사용)
declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  latitude: number;
  longitude: number;
  markers?: { lat: number; lng: number; title: string }[];
}

interface KakaoMapProps {
  latitude: number;
  longitude: number;
  markers?: { lat: number; lng: number; title: string }[];
  onAddressSelect?: (address: string) => void; // 주소 선택 시 호출될 콜백 함수
  onAddressSearch?: (address: string) => void;
}

function KakaoMap({
  latitude,
  longitude,
  markers,
  onAddressSelect,
}: KakaoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { isLoaded } = useKakaoMap();

  useEffect(() => {
    if (isLoaded) {
      window.kakao.maps.load(() => {
        if (mapContainer.current) {
          const mapOption = {
            center: new window.kakao.maps.LatLng(latitude, longitude),
            level: 3,
          };
          const map = new window.kakao.maps.Map(
            mapContainer.current,
            mapOption
          );

          // 기존 마커 표시 로직
          if (markers) {
            markers.forEach((markerInfo) => {
              const markerPosition = new window.kakao.maps.LatLng(
                markerInfo.lat,
                markerInfo.lng
              );
              const marker = new window.kakao.maps.Marker({
                position: markerPosition,
                title: markerInfo.title,
              });
              marker.setMap(map);
            });
          }

          // 주소 선택 기능이 활성화된 경우에만 클릭 이벤트 리스너 추가
          if (onAddressSelect) {
            const geocoder = new window.kakao.maps.services.Geocoder();
            window.kakao.maps.event.addListener(
              map,
              "click",
              function (mouseEvent: any) {
                const coord = mouseEvent.latLng;
                geocoder.coord2Address(
                  coord.getLng(),
                  coord.getLat(),
                  (
                    result: Array<{
                      road_address?: { address_name: string };
                      address?: { address_name: string };
                    }>,
                    status: "OK" | "ZERO_RESULT" | "ERROR"
                  ) => {
                    if (status === window.kakao.maps.services.Status.OK) {
                      const newAddress =
                        result[0]?.road_address?.address_name ||
                        result[0]?.address?.address_name;
                      if (newAddress) {
                        onAddressSelect(newAddress);
                      }
                    }
                  }
                );
              }
            );
          }
        }
      });
    }
  }, [isLoaded, latitude, longitude, markers, onAddressSelect]);

  return <div ref={mapContainer} style={{ width: "100%", height: "400px" }} />;
}

export default memo(KakaoMap);
