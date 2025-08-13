# Header 컴포넌트 명세서

**파일 경로:** `components/header.tsx`

## 1. 개요

웹사이트의 메인 헤더 영역을 담당하는 컴포넌트입니다. 로고, 주요 페이지 네비게이션 링크, 검색창, 사용자 인증 상태에 따른 UI(로그인/회원가입 버튼 또는 사용자 프로필 드롭다운)를 포함합니다. 데스크톱과 모바일 환경에 모두 반응하도록 설계되었습니다.

## 2. 의존성

- **React Hooks:** `useState` (모바일 메뉴의 열림/닫힘 상태 관리)
- **Next.js:** `Link` (페이지 간 네비게이션)
- **UI 라이브러리:**
  - `@/components/ui/button`
  - `@/components/ui/input`
  - `@/components/ui/avatar`
  - `@/components/ui/dropdown-menu`
- **아이콘:** `lucide-react`
- **전역 상태 관리:** `@/contexts/auth-context` (사용자 인증 정보 및 로그아웃 함수)

## 3. Props

이 컴포넌트는 별도의 Props를 전달받지 않습니다. 필요한 모든 데이터(예: 사용자 정보, 인증 상태)는 `useAuth` 훅을 통해 `AuthContext`에서 직접 가져와 사용합니다.

## 4. 주요 기능

### 4.1. 네비게이션

- **로고:** 클릭 시 메인 페이지(`/`)로 이동합니다.
- **주요 메뉴:**
  - 공모전 찾기 (`/contests`)
  - 팀 매칭 (`/teams`)
  - AI추천 받기 (`/ai-recommend`)

### 4.2. 검색

- 데스크톱 및 모바일 뷰에서 공모전을 검색할 수 있는 입력창을 제공합니다. (현재는 UI만 구현됨)

### 4.3. 사용자 인증 UI

`AuthContext`의 `isAuthenticated` 상태에 따라 다른 UI를 렌더링합니다.

- **로그인 상태일 경우:**
  - 사용자 아바타와 사용자명을 표시합니다.
  - 클릭 시 드롭다운 메뉴가 나타나며, '마이페이지'로 이동하는 링크와 '로그아웃' 버튼을 제공합니다.
  - '로그아웃' 버튼 클릭 시 `AuthContext`의 `logout` 함수를 호출합니다.

- **로그아웃 상태일 경우:**
  - '로그인'과 '회원가입' 버튼을 표시하여 각 페이지로 이동할 수 있도록 합니다.

### 4.4. 반응형 디자인 (모바일)

- 화면 너비가 `md` 사이즈 이하일 경우, 햄버거 메뉴 아이콘이 나타납니다.
- 햄버거 메뉴를 클릭하면 네비게이션 링크, 검색창, 로그인/로그아웃 관련 UI가 포함된 모바일 메뉴가 화면에 표시됩니다.

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
