# 콘테스트 애플리케이션 API 가이드

## 목차
1. [API 구조 개요](#api-구조-개요)
2. [API 게이트웨이](#api-게이트웨이)
3. [사용자 서비스 API](#사용자-서비스-api)
4. [대회 서비스 API](#대회-서비스-api)
5. [팀 서비스 API](#팀-서비스-api)
6. [AI 서비스 API](#ai-서비스-api)
7. [채팅 서비스 API](#채팅-서비스-api)
8. [알림 서비스 API](#알림-서비스-api)
9. [주요 API 사용 시나리오](#주요-api-사용-시나리오)

## API 구조 개요

콘테스트 애플리케이션은 마이크로서비스 아키텍처(MSA)를 기반으로 구성되어 있으며, 각 서비스는 독립적인 API를 제공합니다. 모든 API 요청은 API 게이트웨이를 통해 라우팅되며, 채팅 서비스의 WebSocket 연결만 예외적으로 클라이언트에서 직접 연결됩니다.

### 서비스 구성

시스템은 다음과 같은 7개의 주요 마이크로서비스로 구성되어 있습니다:

1. **인증 서비스 (Auth Service)**: 사용자 인증(회원가입, 로그인 등) 및 토큰 관리
2. **사용자 서비스 (User Service)**: 사용자 프로필 관리
3. **대회 서비스 (Contest Service)**: 대회/공모전 정보 관리
4. **팀 서비스 (Team Service)**: 팀 구성 및 매칭 관리
5. **AI 서비스 (AI Service)**: 추천 및 프로파일링 기능
6. **채팅 서비스 (Chat Service)**: 실시간 채팅 기능
7. **알림 서비스 (Notification Service)**: 알림 관리

### API 버전 관리

모든 API는 `/api/v1/` 경로 아래에 위치하며, 버전 관리를 통해 향후 API 변경 시 하위 호환성을 유지합니다.

## API 게이트웨이

API 게이트웨이는 모든 API 요청의 진입점 역할을 하며, 다음과 같은 기능을 제공합니다:

### 라우팅 규칙

| 경로 패턴 | 대상 서비스 |
|---------|------------|
| `/api/v1/auth/**` | Auth Service |                        인교
| `/api/v1/users/**` | User Service |                       인교
| `/api/v1/contests/**` | Contest Service |                 인교
| `/api/v1/teams/**` | Team Service |                       인교
| `/api/v1/notifications/**` | Notification Service |       인교
| `/api/v1/ai/**` | AI Service |                            인교

### 미들웨어 기능

- **세션 인증**: 사용자 인증 및 권한 검증                        인교
- **CORS 처리**: 크로스 오리진 요청 처리                        인교
- **Rate Limiting**: API 호출 제한                              인교
- **Load Balancing**: 서비스 인스턴스 간 부하 분산                  인교

## 인증 서비스 API

인증 서비스는 회원가입, 로그인, 토큰 관리 등 모든 인증 관련 기능을 전담합니다.

### 인증 API

| 메서드 | 엔드포인트 | 설명 | 요청 예시 |
|-------|-----------|------|----------|
| POST | `/auth/register` | 회원가입 | `{"username": "user123", "email": "user@example.com", "password": "password123"}` |  민욱
| POST | `/auth/login` | 로그인 | `{"username": "user123", "password": "password123"}` |    민욱
| POST | `/auth/logout` | 로그아웃 | - |    민욱
| POST | `/auth/verify` | 토큰 유효성 검증 (게이트웨이용) | 쿠키 내 토큰 |  민욱
| POST | `/auth/refresh` | 토큰 갱신 | 쿠키 내 토큰 |   ???

## 사용자 서비스 API

사용자 서비스는 사용자 계정 및 프로필 관리 등의 기능을 제공합니다.

### 사용자 관리 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| GET | `/users/me` | 현재 로그인한 사용자 정보 조회 |                  민욱
| PUT | `/users/me` | 사용자 정보 수정 |                                민욱
| GET | `/users/{userId}` | 특정 사용자 정보 조회 |                     민욱
| GET | `/users/search` | 사용자 검색 |                                 민욱
| POST | `/users/{userId}/follow` | 사용자 팔로우 |                     민욱
| DELETE | `/users/{userId}/follow` | 사용자 언팔로우 |                 민욱
| GET | `/users/me/following` | 내가 팔로우하는 사용자 목록 |               민욱
| GET | `/users/me/followers` | 나를 팔로우하는 사용자 목록 |               민욱

### 프로필 관리 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| GET | `/profiles/me` | 내 프로필 조회 |                               민욱
| PUT | `/profiles/me` | 내 프로필 수정 |                               민욱
| GET | `/profiles/{userId}` | 특정 사용자 프로필 조회 |                  민욱
| PUT | `/profiles/me/visibility` | 프로필 공개 설정 변경 |                 민욱

### NCS & 스킬 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| GET | `/ncs/categories` | NCS 직무 대분류 목록 |                          
| GET | `/ncs/categories/{id}/subcategories` | NCS 직무 중분류 목록 |       
| GET | `/ncs/categories/{id}/detail-categories` | NCS 직무 소분류 목록 |   
| GET | `/skills` | 전체 스킬 목록 |                                        민욱
| GET | `/skills/categories` | 스킬 카테고리 목록 |                         민욱
| GET | `/skills/popular` | 인기 스킬 목록 |                                민욱

### 파일 관리 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| POST | `/files/upload` | 파일 업로드 |                                    
| POST | `/files/profile-image` | 프로필 이미지 업로드 |                     
| GET | `/files/{fileId}` | 파일 다운로드 |                                 
| DELETE | `/files/{fileId}` | 파일 삭제 |                                  

## 대회 서비스 API

대회 서비스는 대회/공모전 정보 관리, 카테고리 관리, 즐겨찾기, 참가 관리 등의 기능을 제공합니다.

### 대회 관리 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| GET | `/contests` | 대회 목록 조회 |                                      현식
| GET | `/contests/{contestId}` | 대회 상세 정보 조회 |                      현식
| GET | `/contests/{contestId}/preview` | 대회 미리보기 정보 조회 |           현식
| POST | `/contests` | 대회 등록 (관리자) |                                  현식
| PUT | `/contests/{contestId}` | 대회 정보 수정 (관리자) |                     현식
| DELETE | `/contests/{contestId}` | 대회 삭제 (관리자) |                   현식

### 카테고리 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| GET | `/categories` | 카테고리 목록 조회 |                                    수경
| GET | `/categories/{categoryId}/contests` | 특정 카테고리의 대회 목록 조회 |    수경

### 즐겨찾기 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| POST | `/contests/{contestId}/favorite` | 대회 즐겨찾기 추가 |                정서
| DELETE | `/contests/{contestId}/favorite` | 대회 즐겨찾기 삭제 |              정서
| GET | `/users/me/favorites` | 내 즐겨찾기 대회 목록 조회 |                        정서

### 참가 관리 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| POST | `/contests/{contestId}/participate` | 대회 참가 신청 |                 
| GET | `/contests/{contestId}/participants` | 대회 참가자 목록 조회 |
| GET | `/users/me/participations` | 내 참가 대회 목록 조회 |
| PUT | `/participations/{id}/result` | 참가 결과 업데이트 |

### 팀 연동 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| GET | `/contests/{contestId}/teams` | 대회 참가 팀 목록 조회 |
| GET | `/contests/{contestId}/teams/recruiting` | 대회 참가 모집 중인 팀 목록 조회 |

## 팀 서비스 API

팀 서비스는 팀 생성 및 관리, 팀 프로필, 멤버 관리, 지원 및 초대 시스템 등의 기능을 제공합니다.

### 팀 관리 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| POST | `/teams` | 팀 생성 |
| GET | `/teams/{teamId}` | 팀 정보 조회 |
| PUT | `/teams/{teamId}` | 팀 정보 수정 |
| DELETE | `/teams/{teamId}` | 팀 삭제 |
| GET | `/teams/my-teams` | 내가 속한 팀 목록 조회 |
| GET | `/teams/my-created-teams` | 내가 생성한 팀 목록 조회 |
| PUT | `/teams/{teamId}/status` | 팀 상태 변경 (모집 중/모집 완료 등) |
| PUT | `/teams/{teamId}/visibility` | 팀 공개 설정 변경 |

### 팀 프로필 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| GET | `/teams/{teamId}/profile` | 팀 프로필 조회 |
| PUT | `/teams/{teamId}/profile` | 팀 프로필 수정 |
| POST | `/teams/{teamId}/profile/logo` | 팀 로고 업로드 |

### 멤버 관리 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| GET | `/teams/{teamId}/members` | 팀 멤버 목록 조회 |
| DELETE | `/teams/{teamId}/members/{userId}` | 팀 멤버 제거 |
| PUT | `/teams/{teamId}/members/{userId}/role` | 팀 멤버 역할 변경 |

### 지원 시스템 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| POST | `/teams/{teamId}/applications` | 팀 지원 신청 |
| GET | `/teams/{teamId}/applications` | 팀 지원 목록 조회 |
| PUT | `/applications/{id}/approve` | 지원 승인 |
| PUT | `/applications/{id}/reject` | 지원 거절 |
| GET | `/users/me/applications` | 내 지원 목록 조회 |
| DELETE | `/applications/{applicationId}` | 지원 취소 |

### 초대 시스템 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| POST | `/teams/{teamId}/invitations` | 팀 초대 발송 |
| GET | `/users/me/invitations` | 내게 온 초대 목록 조회 |
| PUT | `/invitations/{id}/accept` | 초대 수락 |
| PUT | `/invitations/{id}/decline` | 초대 거절 |

### 팀 검색 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| GET | `/teams/search` | 팀 검색 |
| GET | `/teams/recruiting` | 모집 중인 팀 목록 조회 |

## AI 서비스 API

AI 서비스는 AI 챗봇, 프로파일링, 추천 시스템 등의 기능을 제공합니다.

### AI 챗봇 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| POST | `/ai/chat/sessions` | 챗봇 세션 생성 |
| POST | `/ai/chat/sessions/{id}/messages` | 챗봇 메시지 전송 |
| GET | `/ai/chat/sessions/{id}/messages` | 챗봇 대화 내역 조회 |
| DELETE | `/ai/chat/sessions/{sessionId}` | 챗봇 세션 삭제 |

### 프로파일링 챗봇 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| POST | `/ai/profiling/start` | 프로파일링 시작 |
| POST | `/ai/profiling/sessions/{id}/answer` | 프로파일링 질문 답변 |
| GET | `/ai/profiling/sessions/{id}/questions` | 프로파일링 질문 조회 |
| POST | `/ai/profiling/sessions/{id}/complete` | 프로파일링 완료 |
| POST | `/ai/profiling/sessions/{id}/skip` | 프로파일링 건너뛰기 |

### 추천 시스템 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| POST | `/ai/recommendations/contests` | 대회 추천 요청 |
| POST | `/ai/recommendations/teams` | 팀 추천 요청 |
| POST | `/ai/recommendations/members` | 팀원 추천 요청 |
| POST | `/ai/recommendations/contests/refresh` | 대회 추천 갱신 |
| POST | `/ai/recommendations/teams/by-contest` | 특정 대회 기준 팀 추천 요청 |

### 자동 추천 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| GET | `/ai/auto-recommendations/teams/{teamId}` | 팀 자동 추천 조회 |
| POST | `/ai/auto-recommendations/teams/{teamId}/boost` | 팀 추천 강화 |

## 채팅 서비스 API

채팅 서비스는 WebSocket 기반의 실시간 채팅 기능과 채팅방 관리 기능을 제공합니다.

### WebSocket API

| 엔드포인트 | 설명 |
|-----------|------|
| `WS /ws/chat/dm/{roomId}` | 1:1 채팅 WebSocket 연결 |
| `WS /ws/chat/team/{teamId}` | 팀 채팅 WebSocket 연결 |

### 1:1 채팅 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| GET | `/chats/dm/rooms` | 내 1:1 채팅방 목록 조회 |
| POST | `/chats/dm/rooms` | 1:1 채팅방 생성 |
| GET | `/chats/dm/rooms/{roomId}/messages` | 1:1 채팅 메시지 조회 |
| POST | `/chats/dm/rooms/{roomId}/messages` | 1:1 채팅 메시지 전송 |

### 팀 채팅 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| GET | `/chats/team/{teamId}/messages` | 팀 채팅 메시지 조회 |
| POST | `/chats/team/{teamId}/messages` | 팀 채팅 메시지 전송 |
| GET | `/chats/team/{teamId}/members` | 팀 채팅 참여자 목록 조회 |

### 채팅 관리 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| PUT | `/chats/rooms/{roomId}/read` | 채팅방 읽음 표시 |
| GET | `/chats/unread-count` | 안 읽은 메시지 수 조회 |

## 알림 서비스 API

알림 서비스는 알림 관리, 알림 설정, 푸시 알림 등의 기능을 제공합니다.

### 알림 관리 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| GET | `/notifications` | 알림 목록 조회 |
| PUT | `/notifications/{notificationId}/read` | 알림 읽음 표시 |
| PUT | `/notifications/read-all` | 모든 알림 읽음 표시 |
| DELETE | `/notifications/{notificationId}` | 알림 삭제 |

### 알림 설정 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| GET | `/notifications/settings` | 알림 설정 조회 |
| PUT | `/notifications/settings` | 알림 설정 변경 |
| PUT | `/notifications/settings/email` | 이메일 알림 설정 변경 |
| PUT | `/notifications/settings/push` | 푸시 알림 설정 변경 |

### 푸시 알림 API

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| POST | `/notifications/push/subscribe` | 푸시 알림 구독 |
| DELETE | `/notifications/push/unsubscribe` | 푸시 알림 구독 해제 |
| POST | `/notifications/push/send` | 푸시 알림 발송 (내부용) |

## 주요 API 사용 시나리오

### 시나리오 1: 사용자 회원가입 및 프로필 설정

1. `POST /auth/register`: 회원가입
2. `POST /auth/login`: 로그인
3. `POST /auth/verify-phone`: 휴대폰 인증 요청
4. `POST /auth/verify-phone/confirm`: 휴대폰 인증 확인
5. `PUT /profiles/me`: 프로필 정보 입력
6. `POST /files/profile-image`: 프로필 이미지 업로드

### 시나리오 2: AI 프로파일링 및 대회 추천

1. `POST /ai/profiling/start`: 프로파일링 시작
2. `GET /ai/profiling/sessions/{id}/questions`: 프로파일링 질문 조회
3. `POST /ai/profiling/sessions/{id}/answer`: 프로파일링 질문 답변 (여러 번 반복)
4. `POST /ai/profiling/sessions/{id}/complete`: 프로파일링 완료
5. `POST /ai/recommendations/contests`: 대회 추천 요청
6. `GET /contests/{contestId}`: 추천된 대회 상세 정보 조회

### 시나리오 3: 팀 생성 및 팀원 모집

1. `POST /teams`: 팀 생성
2. `PUT /teams/{teamId}/profile`: 팀 프로필 설정
3. `POST /teams/{teamId}/profile/logo`: 팀 로고 업로드
4. `PUT /teams/{teamId}/status`: 팀 상태를 '모집 중'으로 변경
5. `POST /ai/recommendations/members`: 팀원 추천 요청
6. `POST /teams/{teamId}/invitations`: 추천된 사용자에게 초대 발송

### 시나리오 4: 팀 지원 및 채팅

1. `GET /contests/{contestId}/teams/recruiting`: 모집 중인 팀 목록 조회
2. `GET /teams/{teamId}`: 팀 정보 조회
3. `POST /teams/{teamId}/applications`: 팀 지원 신청
4. `POST /chats/dm/rooms`: 팀장과 1:1 채팅방 생성
5. `POST /chats/dm/rooms/{roomId}/messages`: 팀장에게 메시지 전송
6. `WS /ws/chat/dm/{roomId}`: WebSocket 연결로 실시간 채팅

### 시나리오 5: 대회 참가 및 알림 관리

1. `POST /contests/{contestId}/favorite`: 관심 있는 대회 즐겨찾기
2. `POST /contests/{contestId}/participate`: 대회 참가 신청
3. `POST /notifications/push/subscribe`: 푸시 알림 구독
4. `PUT /notifications/settings`: 알림 설정 변경
5. `GET /notifications`: 알림 목록 조회
6. `PUT /notifications/{notificationId}/read`: 알림 읽음 표시