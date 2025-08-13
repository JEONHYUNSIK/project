
# 채팅 시스템 API 문서

### 주요 특징

- **API Gateway 우회**: WebSocket 연결은 Chat Service에 직접 연결
- **독립적 인증**: Redis를 통한 JWT 토큰 자체 검증
- **마이크로서비스 연동**: Docker 컨테이너 기반 서비스 통신
- **고가용성**: Erlang/OTP의 장애 복구 메커니즘 활용

## 🗄️ 데이터베이스 구조

### Scylla DB
- **채팅방 메타데이터**: 채팅방 정보, 참가자 정보 저장
- **채팅방 메시지**: 채팅방 ID와 매칭되어 메시지 저장

### Redis
- **JWT 토큰**: 인증 토큰 저장 및 검증
- **세션 관리**: 사용자 세션 상태 관리
- **최근 채팅 기록**: 채팅방별 최근 메시지 20개 캐싱

### 채팅 데이터 구조
```json
{
  "chatroomId": "room001",
  "messages": [
    {
      "userId": "user123",
      "content": "안녕하세요!",
      "timestamp": "2025-01-15T14:30:00Z"
    },
    {
      "userId": "user456", 
      "content": "반갑습니다!",
      "timestamp": "2025-01-15T14:31:00Z"
    }
  ]
}
```

## 🔐 인증 시스템

### 인증 플로우

```
1. 클라이언트 → auth-server 로그인 API 호출
2. 성공 시 JWT 토큰 생성 → Redis + 브라우저 쿠키에 저장
3. 일반 API: 클라이언트 → API Gateway → 인증 → 마이크로서비스
4. Chat Service: 클라이언트 → Chat Service → Redis 직접 인증
```

### WebSocket 핸드쉐이크 인증

```http
클라이언트 → 서버 (HTTP 요청):
GET /chat HTTP/1.1
Host: chat-service:8080
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Cookie: jwt_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

서버 → 클라이언트 (성공):
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

서버 → 클라이언트 (인증 실패):
HTTP/1.1 401 Unauthorized
{"error": "invalid_token", "message": "JWT token is invalid"}
```

### 인증 모듈 구조

```erlang
Authentication Module:
├── JWT Token Validator
│   ├── 쿠키에서 JWT 토큰 추출
│   ├── 토큰 형식 및 서명 검증
│   └── 토큰 만료 시간 확인
├── Redis Client
│   ├── 토큰 존재 여부 확인
│   ├── 사용자 세션 정보 조회
│   └── 주기적 토큰 재검증
└── Session Manager
    ├── 인증된 연결 상태 관리
    ├── 토큰 만료 시 연결 종료
    └── 재로그인 요청 처리
```

사용자 입력 → 문자열 (예: "안녕하세요")

문자열을 UTF-8 인코딩 → bytes (바이트 배열)

웹소켓 전송 → UTF-8 바이트를 전송하거나 문자열 그대로 전송

수신 측에서 UTF-8 바이트를 디코딩 → 문자열로 복원

## 1. 채팅방 생성 및 관리

### 1.1 채팅방 생성 API
- **Method:** `POST /api/chatrooms`
- **Request Body:**
```json
{
  "creatorId": "user123",
  "targetUserIds": ["user456", "user789"],
  "name": "Study Group",
  "createdAt": "2025-07-15T13:00:00Z"
}
```
- **비즈니스 로직:**
  - 참여자 수가 3명 이상일 경우 생성자에게 `admin` 권한 부여
- **Response:**
```json
{
  "roomId": "room001",
  "name": "Study Group",
  "createdAt": "2025-07-15T13:00:00Z",
  "participants": [
    { "userId": "user123", "edited_name": "이름", "role": "admin" },
    { "userId": "user456", "edited_name": "이름", "role": "member" },
    { "userId": "user789", "edited_name": "", "role": "member" }
  ],
  "userCount": 3
}
```

### 1.2 채팅방 이름 변경 API
- **Method:** `PATCH /api/chatrooms/{roomId}/name`
- **Request Body:**
```json
{
  "name": "New Chat Room Name"
}
```

### 1.3 참가자 추가 API
- **Method:** `POST /api/chatrooms/{roomId}/participants`
- **Request Body:**
```json
{
  "userId": "user456",
  "role": "member"  // 기본값 member
}
```

### 1.4 참가자 삭제 API
- **Method:** `DELETE /api/chatrooms/{roomId}/participants/{userId}`

### 1.5 참가자 역할 변경 API
- **Method:** `PATCH /api/chatrooms/{roomId}/participants/{userId}/role`
- **Request Body:**
```json
{
  "role": "sub-admin"  // admin, sub-admin, member 가능
}
```

### 1.5.1 참가자 이름 변경 API -> 추가해야함
- 이 기능은 채팅방 내의 edited_name값을 변경시킴. 만약 이 값이 기본값이면 user service에서 user id값을 조회하여 이름을 기본적으로 사용하고, 이 값이 채워져있으면 채팅방 내에서 이 이름을 사용함.

### 1.6 채팅방 삭제 API
- **Method:** `DELETE /api/chatrooms/{roomId}`

## 2. 채팅 메시지 관리 API

### 2.1 채팅 보내기 API
- **Method:** `POST /api/chatrooms/{roomId}/messages`
- **Request Body:**
```json
{
  "userId": "user123",
  "content": "안녕하세요!"
}
```
- **Response:**
```json
{
  "messageId": "msg789",
  "roomId": "room456",
  "userId": "user123",
  "content": "안녕하세요!",
  "createdAt": "2025-07-15T14:00:00Z"
}
```

### 2.2 채팅 삭제 API
- **Method:** `DELETE /api/chatrooms/{roomId}/messages/{messageId}`
- **Request Body:**
```json
{
  "userId": "user123"
}
```
- **조건:** `userId`가 메시지 작성자여야 삭제 가능

### 2.3 채팅 편집 API
- **Method:** `PATCH /api/chatrooms/{roomId}/messages/{messageId}`
- **Request Body:**
```json
{
  "userId": "user123",
  "newContent": "수정된 메시지 내용"
}
```
- **조건:** `userId`가 메시지 작성자여야 수정 가능

### 2.4 채팅 읽음 처리 API
- **Method:** `POST /api/chatrooms/{roomId}/messages/{messageId}/read`
- **Request Body:**
```json
{
  "userId": "user123"
}
```

### 2.5 채팅 반응 API
- **Method:** `POST /api/chatrooms/{roomId}/messages/{messageId}/reactions`
- **Request Body:**
```json
{
  "userId": "user123",
  "reactionType": "like"  // like, love, laugh, sad, angry 등
}
```

3. 채팅방 입장 및 실시간 Room

3.1 채팅방 입장 (웹소켓 Room 연결)
POST /api/chatrooms/{chatroomId}/connect
{
  "userId": "user1"
}

- Room은 실시간 처리를 위한 소켓 레벨의 단위
- 하나의 Room은 하나의 chatroomId에 매핑됨

4. Room 생명주기 및 상태

Room 상태 흐름
creating → active → idle → closing → closed

상태 정의

상태        설명
creating  첫 사용자 입장 시 생성
active    사용자 활동 중
idle      마지막 사용자 퇴장 → 타이머 시작 (예: 30분)
closing   타이머 만료 → 리소스 정리 중
          입장 불가
closed    종료 완료, Room 제거됨

5. 사용자 입퇴장 흐름

입장
1. RoomManager가 해당 chatroomId room 존재 확인
2. 없으면 Room 프로세스 생성 (creating → active)
3. 사용자 참여자 목록에 등록

퇴장
1. 사용자 제거
2. 남은 사용자가 없다면 → idle 전이 및 타이머 시작
3. 타임아웃 시 closing → closed 전이 및 리소스 정리


6. Room 동기화 정책 (Active 상태)

- Room이 active 상태일 때, 채팅방 정보 변경 API가 호출되면:
  - 변경사항은 즉시 Room 프로세스에 반영
  - 예: 이름, 참가자, 역할
- 필요 시 사용자들에게 실시간 broadcast 이벤트 전송
- Room이 idle/closing/closed 상태일 경우 반영 안됨 (DB에만 적용)


7. 로깅 전략

로그 레벨

레벨   설명
ERROR 시스템 장애, 인증 실패
WARN  비정상 연결, 타임아웃
INFO  Room 생성/삭제, 사용자 입퇴장
DEBUG 메시지 처리, 상태 변경 등 상세 흐름

로그 포맷

[timestamp] [LEVEL] [PID] [userId] [roomId] - message

예시:

[2025-07-15T14:32:10.245Z] [INFO] [PID:2831] [user123] [room789] - Room created successfully.
[2025-07-15T14:35:21.123Z] [WARN] [PID:2831] [user123] [room789] - WebSocket reconnect failed.
[2025-07-15T14:40:05.674Z] [ERROR] [PID:2831] [user456] [room789] - Authentication failed.

- userId, roomId는 해당 시에만 포함
- ERROR는 스택 트레이스 포함

로그 저장/전송

- 단기: 로컬 로그 + logrotate
- 중기: 중앙 로그 수집 (예: Elasticsearch, Loki)
- 장기: ERROR 로그는 Slack/Email 등 알림 전송

채팅 영구 저장은 Scylla DB 사용