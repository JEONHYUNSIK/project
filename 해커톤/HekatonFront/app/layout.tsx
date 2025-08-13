import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { KakaoMapProvider } from "@/contexts/kakao-map-context";
import { AuthProvider, TeamProvider } from "@/contexts/auth-context"
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "이퀄로컬 - 공모전 플랫폼",
  description: "공모전과 팀 매칭을 통해 여러분의 꿈을 실현해보세요",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <TeamProvider>
          <KakaoMapProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </KakaoMapProvider>
        </TeamProvider>
      <Toaster />
        {/* 카카오맵 API 스크립트 로드 */}
        
      </body>
    </html>
  );
}
