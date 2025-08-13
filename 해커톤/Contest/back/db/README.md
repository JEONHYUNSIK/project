# ContestApp 데이터베이스 설정 가이드

이 문서는 ContestApp 프로젝트의 데이터베이스 설정 및 사용 방법에 대한 가이드입니다.

## 개요

ContestApp은 마이크로서비스 아키텍처를 기반으로 하며, 다음과 같은 데이터베이스를 사용합니다:

1. **PostgreSQL**: 관계형 데이터를 저장하는 주요 데이터베이스
2. **MongoDB**: 비정형 데이터(채팅 메시지, AI 대화 로그 등)를 저장하는 데이터베이스
3. **Redis**: 세션, 캐시, 실시간 데이터를 저장하는 인메모리 데이터베이스

각 마이크로서비스는 자신에게 할당된 데이터베이스 리소스에 접근합니다.

## 데이터베이스 구조

### PostgreSQL 스키마

PostgreSQL 데이터베이스는 다음과 같은 스키마로 구성됩니다:

1. **user_service**: 사용자 서비스 관련 테이블
   - users: 사용자 기본 정보
   - profiles: 사용자 프로필 정보
   - skills: 기술 스택 정보
   - user_skills: 사용자-기술 연결 정보
   - ncs_categories: NCS 직무 분류 정보
   - files: 파일 메타데이터
   - follows: 팔로우 관계

2. **contest_service**: 대회 서비스 관련 테이블
   - contests: 대회/공모전 정보
   - categories: 카테고리 정보
   - contest_categories: 대회-카테고리 연결 정보
   - favorites: 즐겨찾기 정보
   - participations: 참가 정보

3. **team_service**: 팀 서비스 관련 테이블
   - teams: 팀 기본 정보
   - team_profiles: 팀 프로필 정보
   - team_members: 팀원 정보
   - applications: 지원 정보
   - invitations: 초대 정보

4. **notification_service**: 알림 서비스 관련 테이블
   - notifications: 알림 정보
   - notification_settings: 알림 설정 정보
   - push_subscriptions: 푸시 알림 구독 정보

5. **ai_service**: AI 서비스 관련 테이블
   - ai_settings: AI 설정 정보
   - recommendations: 추천 정보
   - feedback: 사용자 피드백 정보
   - user_profiling: 사용자 프로파일링 결과

### MongoDB 컬렉션

MongoDB 데이터베이스는 다음과 같은 컬렉션으로 구성됩니다:

1. **채팅 서비스 컬렉션**
   - chat_rooms: 채팅방 정보
   - chat_messages: 채팅 메시지
   - chat_participants: 채팅 참여자 정보

2. **AI 서비스 컬렉션**
   - ai_chat_sessions: AI 챗봇 세션
   - ai_chat_messages: AI 챗봇 메시지
   - profiling_sessions: 프로파일링 세션 정보

### Redis 데이터 구조

Redis는 다음과 같은 데이터베이스 번호로 구성됩니다:

- DB 0: 공통 (시스템 전체)
- DB 1: 사용자 서비스 (세션)
- DB 2: 사용자 서비스 (캐시)
- DB 3: 대회 서비스 (캐시)
- DB 4: 팀 서비스 (캐시)
- DB 5: AI 서비스 (캐시)
- DB 6: 채팅 서비스 (실시간 데이터)
- DB 7: 알림 서비스 (실시간 데이터)
- DB 8-15: 예약 (확장용)

## 데이터베이스 초기화

### Docker Compose를 통한 초기화

프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 데이터베이스를 초기화할 수 있습니다:

```bash
docker-compose up -d postgres mongodb redis
```

이 명령어는 PostgreSQL, MongoDB, Redis 컨테이너를 시작하고, 초기화 스크립트를 실행합니다.

### 초기화 스크립트

초기화 스크립트는 다음 위치에 있습니다:

- PostgreSQL: `back/db/init-postgres.sql`
- MongoDB: `back/db/init-mongodb.js`
- Redis: `back/db/init-redis.conf`

이 스크립트들은 Docker Compose를 통해 자동으로 실행됩니다.

## 데이터베이스 접근

### 환경 변수

데이터베이스 접근 정보는 `.env` 파일에 정의되어 있습니다. 각 마이크로서비스는 이 환경 변수를 사용하여 데이터베이스에 접근합니다.

### PostgreSQL 접근

```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=user
POSTGRES_PASSWORD=a1234
POSTGRES_DB=contestapp
POSTGRES_USER_SCHEMA=user_service
POSTGRES_CONTEST_SCHEMA=contest_service
POSTGRES_TEAM_SCHEMA=team_service
POSTGRES_NOTIFICATION_SCHEMA=notification_service
POSTGRES_AI_SCHEMA=ai_service
```

### MongoDB 접근

```
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_USER=user
MONGO_PASSWORD=a1234
MONGO_DB=contestapp
MONGO_CHAT_ROOMS_COLLECTION=chat_rooms
MONGO_CHAT_MESSAGES_COLLECTION=chat_messages
MONGO_CHAT_PARTICIPANTS_COLLECTION=chat_participants
MONGO_AI_CHAT_SESSIONS_COLLECTION=ai_chat_sessions
MONGO_AI_CHAT_MESSAGES_COLLECTION=ai_chat_messages
MONGO_PROFILING_SESSIONS_COLLECTION=profiling_sessions
```

### Redis 접근

```
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_COMMON_DB=0
REDIS_USER_SESSION_DB=1
REDIS_USER_CACHE_DB=2
REDIS_CONTEST_CACHE_DB=3
REDIS_TEAM_CACHE_DB=4
REDIS_AI_CACHE_DB=5
REDIS_CHAT_REALTIME_DB=6
REDIS_NOTIFICATION_REALTIME_DB=7
```

## 관리 도구 접근

### PostgreSQL

- 접속 정보: localhost:5432
- 사용자: user
- 비밀번호: a1234
- 데이터베이스: contestapp
- 관리 도구: DBeaver, pgAdmin 등

### MongoDB

- 접속 정보: localhost:27017
- 사용자: user
- 비밀번호: a1234
- 데이터베이스: contestapp
- 관리 도구: MongoDB Compass, Robo 3T 등

### Redis

- 접속 정보: localhost:6379
- 비밀번호: (없음)
- 관리 도구: Redis Desktop Manager, RedisInsight 등

## 테스트 데이터

초기화 스크립트에는 기본적인 테스트 데이터가 포함되어 있습니다:

- PostgreSQL: 테스트 사용자, 카테고리, 기술 스택, NCS 직무 분류, 테스트 대회
- MongoDB: 테스트 채팅방, 채팅 메시지, 채팅 참여자, AI 챗봇 세션, AI 챗봇 메시지

추가 테스트 데이터가 필요한 경우, 각 서비스의 개발 과정에서 생성할 수 있습니다.

## 백업 및 복원

### PostgreSQL 백업

```bash
docker exec contestapp-postgres pg_dump -U user -d contestapp > backup.sql
```

### PostgreSQL 복원

```bash
cat backup.sql | docker exec -i contestapp-postgres psql -U user -d contestapp
```

### MongoDB 백업

```bash
docker exec contestapp-mongodb mongodump --username user --password a1234 --db contestapp --out /dump
docker cp contestapp-mongodb:/dump ./dump
```

### MongoDB 복원

```bash
docker cp ./dump contestapp-mongodb:/dump
docker exec contestapp-mongodb mongorestore --username user --password a1234 --db contestapp /dump/contestapp
```

### Redis 백업

Redis는 RDB 파일과 AOF 파일을 통해 자동으로 백업됩니다. 필요한 경우 다음 명령어로 수동 백업을 트리거할 수 있습니다:

```bash
docker exec contestapp-redis redis-cli SAVE
```

## 문제 해결

### 연결 문제

데이터베이스 연결에 문제가 있는 경우, 다음을 확인하세요:

1. Docker 컨테이너가 실행 중인지 확인:
   ```bash
   docker-compose ps
   ```

2. 로그 확인:
   ```bash
   docker-compose logs postgres
   docker-compose logs mongodb
   docker-compose logs redis
   ```

3. 네트워크 연결 확인:
   ```bash
   docker network inspect contestapp-network
   ```

4. 환경 변수 설정 확인:
   ```bash
   cat .env
   ```

### 데이터 초기화 문제

초기화 스크립트 실행에 문제가 있는 경우, 다음을 시도하세요:

1. 볼륨 삭제 후 재시작:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

2. 초기화 스크립트 수동 실행:
   ```bash
   # PostgreSQL
   cat back/db/init-postgres.sql | docker exec -i contestapp-postgres psql -U user
   
   # MongoDB
   docker cp back/db/init-mongodb.js contestapp-mongodb:/init-mongodb.js
   docker exec contestapp-mongodb mongo -u user -p a1234 --authenticationDatabase admin /init-mongodb.js
   
   # Redis
   docker cp back/db/init-redis.conf contestapp-redis:/usr/local/etc/redis/redis.conf
   docker restart contestapp-redis
   ```

## 참고 사항

- 개발 환경에서만 사용하세요.
- 실제 배포 환경에서는 보안 설정을 강화해야 합니다.
- 각 서비스의 상세 설정은 해당 서비스 디렉토리의 문서를 참조하세요.