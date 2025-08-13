"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import Script from "next/script";

// 카카오맵 API 스크립트 로딩 상태

interface KakaoMapContextType {
  isLoaded: boolean;
}

const KakaoMapContext = createContext<KakaoMapContextType>({
  isLoaded: false,
});

export function KakaoMapProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e: any) => {
    console.error("Script failed to load:", e);
  };

  return (
    <KakaoMapContext.Provider value={{ isLoaded }}>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`}
        strategy="afterInteractive"
        onLoad={handleLoad}
        onError={handleError}
      />
      {children}
    </KakaoMapContext.Provider>
  );
}

export const useKakaoMap = () => {
  const context = useContext(KakaoMapContext);
  if (context === undefined) {
    throw new Error("useKakaoMap must be used within a KakaoMapProvider");
  }
  return context;
};
