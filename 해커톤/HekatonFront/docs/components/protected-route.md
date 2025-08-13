# ProtectedRoute 컴포넌트 명세서

**파일 경로:** `components/protected-route.tsx`

## 1. 개요

`ProtectedRoute`는 특정 페이지나 컴포넌트를 인증된 사용자에게만 접근을 허용하도록 보호하는 역할을 하는 고차 컴포넌트(Higher-Order Component, HOC)입니다. 사용자가 인증되지 않은 경우, 지정된 페이지(기본값: `/login`)로 리다이렉트시킵니다.

## 2. 의존성

- **React Hooks:** `useEffect`
- **Next.js:** `useRouter` (리다이렉션을 위해 사용)
- **전역 상태 관리:** `@/contexts/auth-context` (`isAuthenticated`, `isLoading` 상태를 가져옴)
- **UI 라이브러리:**
  - `@/components/ui/card` (로딩 화면 UI)
  - `lucide-react` (`Loader2` 아이콘)

## 3. Props

| Prop 이름 | 타입 | 필수 여부 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `children` | `React.ReactNode` | 예 | - | 보호할 페이지 또는 컴포넌트들입니다. |
| `redirectTo` | `string` | 아니요 | `"/login"` | 인증되지 않은 사용자를 리다이렉트시킬 경로입니다. |

## 4. 주요 기능

- **인증 상태 확인:** `AuthContext`를 통해 사용자의 인증 상태(`isAuthenticated`)와 로딩 상태(`isLoading`)를 확인합니다.
- **로딩 UI 표시:** 사용자 인증 정보를 확인하는 동안(`isLoading`이 `true`일 때) 로딩 스피너와 함께 "로딩 중..." 메시지를 표시하여 사용자 경험을 향상시킵니다.
- **리다이렉션:**
  - 로딩이 완료되고 사용자가 인증되지 않은 상태(`!isAuthenticated`)이면, `redirectTo` Prop으로 지정된 경로로 사용자를 리다이렉트시킵니다.
  - 리다이렉트가 발생하는 동안에는 `null`을 렌더링하여 불필요한 콘텐츠가 잠시라도 표시되는 것을 방지합니다.
- **콘텐츠 렌더링:** 사용자가 성공적으로 인증된 경우에만 `children`으로 전달된 컴포넌트를 렌더링합니다.

## 5. 사용 예시

인증이 필요한 페이지(예: 마이페이지)를 감싸서 사용합니다. 이렇게 하면 로그인하지 않은 사용자가 `/mypage`에 접근하려고 할 때 자동으로 로그인 페이지로 이동시킬 수 있습니다.

```tsx
// app/mypage/layout.tsx

import ProtectedRoute from '@/components/protected-route';

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      {/* 이 안의 모든 자식 컴포넌트들은 보호됩니다. */}
      {children}
    </ProtectedRoute>
  );
}
```

특정 페이지로 리다이렉트 시키고 싶을 경우 `redirectTo` prop을 사용합니다.

```tsx
// app/admin/layout.tsx

import ProtectedRoute from '@/components/protected-route';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // 관리자 페이지 접근 실패 시 홈으로 리다이렉트
    <ProtectedRoute redirectTo="/">
      {children}
    </ProtectedRoute>
  );
}
```
