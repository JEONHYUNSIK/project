# 팀 서비스 개발 가이드라인

이 문서는 `team-service` 마이크로서비스의 개발 계획을 간략하게 설명합니다.

## 1. 서비스 개요

*   **서비스 이름:** 팀 서비스 (Team Service)
*   **주요 목표:** 콘테스트 애플리케이션 생태계 내에서 팀 생성, 멤버 관리, 지원 및 초대를 포함한 팀 관련 모든 기능을 관리합니다.
*   **의존성:** 이 서비스는 주로 `user-service`(사용자 데이터 조회) 및 `contest-service`(팀과 특정 콘테스트 연결)와 상호작용합니다.

## 2. 기술 스택

*   **프레임워크:** Spring Boot 3
*   **언어:** Java 21
*   **데이터베이스:** PostgreSQL
*   **ORM:** Spring Data JPA (Hibernate)
*   **API 문서화:** SpringDoc (Swagger UI)
*   **빌드 도구:** Gradle

## 3. 데이터 모델 (엔티티)

서비스 기능을 지원하기 위해 다음 데이터베이스 엔티티를 생성합니다.

### `Team` 엔티티
*   `team_id` (기본 키, Long)
*   `name` (문자열)
*   `description` (텍스트)
*   `status` (Enum: `RECRUITING` - 모집 중, `RECRUITMENT_COMPLETE` - 모집 완료, `DISBANDED` - 해체됨)
*   `visibility` (Enum: `PUBLIC` - 공개, `PRIVATE` - 비공개)
*   `contest_id` (Long, `contest-service`를 참조하는 외래 키)
*   `leader_id` (Long, `user-service`를 참조하는 외래 키)
*   `created_at` (타임스탬프)
*   `updated_at` (타임스탬프)

### `TeamMember` 엔티티
*   `team_member_id` (기본 키, Long)
*   `team_id` (외래 키, Long)
*   `user_id` (외래 키, Long)
*   `role` (Enum: `LEADER` - 팀장, `MEMBER` - 팀원)
*   `joined_at` (타임스탬프)

### `TeamApplication` 엔티티
*   `application_id` (기본 키, Long)
*   `team_id` (외래 키, Long)
*   `user_id` (외래 키, Long)
*   `status` (Enum: `PENDING` - 대기 중, `APPROVED` - 승인됨, `REJECTED` - 거절됨)
*   `message` (텍스트)
*   `applied_at` (타임스탬프)

### `TeamInvitation` 엔티티
*   `invitation_id` (기본 키, Long)
*   `team_id` (외래 키, Long)
*   `user_id` (외래 키, Long, 초대받은 사용자)
*   `inviter_id` (외래 키, Long, 초대를 보낸 사용자)
*   `status` (Enum: `PENDING` - 대기 중, `ACCEPTED` - 수락됨, `DECLINED` - 거절됨)
*   `message` (텍스트)
*   `invited_at` (타임스탬프)

## 4. API 엔드포인트 명세

다음 RESTful API 엔드포인트를 구현합니다. 모든 경로는 `/api/teams` 접두사를 가집니다.

### 팀 관리 API
*   `POST /teams`: 팀 생성
*   `GET /teams/{teamId}`: 팀 정보 조회
*   `PUT /teams/{teamId}`: 팀 정보 수정
*   `DELETE /teams/{teamId}`: 팀 삭제
*   `GET /teams/my-teams`: 내가 속한 팀 목록 조회
*   `GET /teams/my-created-teams`: 내가 생성한 팀 목록 조회
*   `PUT /teams/{teamId}/status`: 팀 상태 변경 (모집 중/모집 완료 등)
*   `PUT /teams/{teamId}/visibility`: 팀 공개 설정 변경

### 팀 프로필 API
*   `GET /teams/{teamId}/profile`: 팀 프로필 조회
*   `PUT /teams/{teamId}/profile`: 팀 프로필 수정
*   `POST /teams/{teamId}/profile/logo`: 팀 로고 업로드

### 멤버 관리 API
*   `GET /teams/{teamId}/members`: 팀 멤버 목록 조회
*   `DELETE /teams/{teamId}/members/{userId}`: 팀 멤버 제거
*   `PUT /teams/{teamId}/members/{userId}/role`: 팀 멤버 역할 변경

### 지원 시스템 API
*   `POST /teams/{teamId}/applications`: 팀 지원 신청
*   `GET /teams/{teamId}/applications`: 팀 지원 목록 조회
*   `PUT /applications/{id}/approve`: 지원 승인
*   `PUT /applications/{id}/reject`: 지원 거절
*   `GET /users/me/applications`: 내 지원 목록 조회
*   `DELETE /applications/{id}`: 지원 취소

### 초대 시스템 API
*   `POST /teams/{teamId}/invitations`: 팀 초대 발송
*   `GET /users/me/invitations`: 내게 온 초대 목록 조회
*   `PUT /invitations/{id}/accept`: 초대 수락
*   `PUT /invitations/{id}/decline`: 초대 거절

### 팀 검색 API
*   `GET /teams/search`: 팀 검색
*   `GET /teams/recruiting`: 모집 중인 팀 목록 조회

### 대회 연동 API
*   `GET /contests/{contestId}/teams`: 대회 참가 팀 목록 조회

## 5. 주요 시나리오 흐름

### 팀 생성 과정
1.  사용자가 팀 생성을 요청합니다. (Client -> API Gateway -> Team Service)
2.  `TeamService`는 요청한 사용자의 정보를 `UserService`를 통해 확인하여 팀장 권한을 부여합니다.
3.  `TeamService`는 팀 정보의 유효성을 검사합니다.
4.  `TeamService`는 데이터베이스에 팀 정보(Team, TeamMember)를 저장합니다.
5.  `TeamService`는 생성된 팀 정보를 사용자에게 응답합니다.

### 팀 지원 및 승인 과정
1.  지원자(User A)가 특정 팀에 지원서를 제출합니다. (Client -> API Gateway -> Team Service)
2.  `TeamService`는 지원서 상태를 'PENDING'으로 하여 데이터베이스에 저장합니다.
3.  `TeamService`는 `NotificationService`를 통해 팀장(User B)에게 지원서 도착 알림을 전송합니다.
4.  팀장은 지원서 목록을 조회하여 지원 내용을 확인합니다.
5.  팀장은 해당 지원서를 승인합니다. (Client -> API Gateway -> Team Service)
6.  `TeamService`는 지원서 상태를 'APPROVED'로 변경하고, 지원자를 팀 멤버로 추가합니다.
7.  `TeamService`는 `NotificationService`를 통해 지원자에게 지원 승인 알림을 전송합니다.

### 팀 초대 및 수락 과정
1.  팀장(User B)이 특정 사용자(User C)에게 팀 초대를 보냅니다. (Client -> API Gateway -> Team Service)
2.  `TeamService`는 초대장 상태를 'PENDING'으로 하여 데이터베이스에 저장합니다.
3.  `TeamService`는 `NotificationService`를 통해 초대받은 사용자에게 초대장 도착 알림을 전송합니다.
4.  초대받은 사용자는 자신에게 온 초대 목록을 조회하여 초대 내용을 확인합니다.
5.  초대받은 사용자는 해당 초대를 수락합니다. (Client -> API Gateway -> Team Service)
6.  `TeamService`는 초대장 상태를 'ACCEPTED'로 변경하고, 초대받은 사용자를 팀 멤버로 추가합니다.
7.  `TeamService`는 `NotificationService`를 통해 팀장에게 초대 수락 알림을 전송합니다.

## 6. 단계별 개발 계획

(이전과 동일)
