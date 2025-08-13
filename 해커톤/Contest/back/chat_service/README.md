# 🚀 Contest Platform Chat Service

Erlang/OTP 기반의 실시간 채팅 서비스입니다.

## 📋 특징

- **WebSocket 기반** 실시간 통신
- **Cowboy HTTP 서버** 사용
- **JSON 메시지 프로토콜**
- **MongoDB/Redis 연동** 준비
- **Docker 컨테이너** 지원

## 🛠️ 로컬 개발 환경

### 1. 의존성 다운로드 및 컴파일
```bash
./rebar3 get-deps
./rebar3 compile
```

### 2. 서버 실행
```bash
./rebar3 shell
```

### 3. 서버 확인
- HTTP API: http://localhost:8085/
- 헬스체크: http://localhost:8085/health
- WebSocket: ws://localhost:8085/chat

## 🐳 Docker 사용법

### 1. 개별 컨테이너 실행
```bash
# 이미지 빌드
docker build -t contestapp-chat-service .

# 컨테이너 실행
docker run -p 8085:8085 contestapp-chat-service
```

### 2. Docker Compose 사용
```bash
# 전체 시스템 실행
docker-compose up -d

# chat-service만 실행
docker-compose up -d chat-service

# 로그 확인
docker-compose logs -f chat-service
```

## 🔧 API 엔드포인트

### HTTP API
- `GET /` - 서비스 정보
- `GET /health` - 헬스체크

### WebSocket API
- `WS /chat` - 채팅 연결

## 📝 WebSocket 메시지 형식

### 클라이언트 → 서버
```json
{
  "action": "ping" | "test",
  "message": "메시지 내용",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 서버 → 클라이언트
```json
{
  "type": "system" | "pong" | "echo" | "error",
  "message": "메시지 내용",
  "timestamp": 1705311000
}
```

## 🧪 테스트

### 브라우저 테스트
`test_chat.html` 파일을 브라우저에서 열어서 WebSocket 연결을 테스트할 수 있습니다.

### Docker 환경 테스트
```bash
# 서비스 실행
docker-compose up -d chat-service

# 브라우저에서 확인
# http://localhost:8085/
# ws://localhost:8085/chat
```

## 🔗 내부 서비스 연결

Docker Compose 환경에서는 다음 호스트명을 사용합니다:
- MongoDB: `contestapp-mongodb:27017`
- Redis: `contestapp-redis:6379`

## 📊 지원 액션

- `ping` - 서버 응답 테스트
- `test` - 에코 메시지 테스트

## 🌐 환경 변수

- `PORT`: 서버 포트 (기본값: 8085)
- `MONGODB_HOST`: MongoDB 호스트
- `MONGODB_PORT`: MongoDB 포트
- `REDIS_HOST`: Redis 호스트
- `REDIS_PORT`: Redis 포트
