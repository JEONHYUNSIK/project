# Footer 컴포넌트 명세서

**파일 경로:** `components/footer.tsx`

## 1. 개요

웹사이트의 최하단에 위치하는 푸터(Footer) 영역을 담당하는 컴포넌트입니다. 사이트의 주요 서비스 링크, 고객지원 관련 링크, 소셜 미디어 링크, 그리고 저작권 정보를 포함합니다.

## 2. 의존성

- **Next.js:** `Link` (페이지 간 네비게이션)
- **아이콘:** `lucide-react` (Facebook, Twitter, Instagram 아이콘)

## 3. Props

이 컴포넌트는 별도의 Props를 전달받지 않습니다.

## 4. 주요 기능

### 4.1. 정보 및 링크 제공

- **로고 및 소개:** 사이트의 로고와 간단한 소개 문구를 표시합니다.
- **소셜 미디어 링크:** 페이스북, 트위터, 인스타그램 등 소셜 미디어 채널로 연결되는 링크를 제공합니다. (현재 링크는 `#`로 설정되어 있음)
- **서비스 링크:**
  - 공모전 찾기 (`/contests`)
  - 팀 매칭 (`/teams`)
  - AI 추천 (`/ai-recommend`)
  - 마이페이지 (`/mypage`)
- **고객지원 링크:**
  - 이용약관 (`/terms`)
  - 개인정보처리방침 (`/privacy`)
  - 도움말 (`/help`)
  - 문의하기 (`/contact`)
- **저작권 정보:** 사이트의 저작권 정보를 표시합니다.

## 5. 사용 예시

이 컴포넌트는 전체 페이지 레이아웃의 일부로 사용됩니다. 일반적으로 `app/layout.tsx` 파일에 포함되어 모든 페이지에 공통으로 표시됩니다.

```tsx
// app/layout.tsx

import Header from '@/components/header';
import Footer from '@/components/footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```
