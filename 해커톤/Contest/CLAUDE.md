# CLAUDE.md

### Always Respond In Korean #Important
### 읽기 쉬운 코드가 최고의 코드니까 항상 읽기 쉽게 작성 할 것. #Important

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ContestApp is a microservices-based platform for managing programming contests and competitions. The system uses Docker Compose for orchestration and consists of multiple backend services with different tech stacks.

## Architecture

The system follows a microservices architecture with:

### Backend Services
- **auth-server** (Go): JWT-based authentication service (port 60000)
- **api-gateway** (F#/.NET 9): Main API gateway using Giraffe framework (port 8080)
- **user-service** (Java/Spring Boot): User management and profiles (port 8081)
- **contest-service** (Java/Spring Boot): Contest and competition management (port 8083)
- **chat-service** (Erlang/OTP): Real-time WebSocket chat service (port 8085)
- **team-service**, **notification-service**, **ai-service**: Placeholder services (not yet implemented)

### Infrastructure
- **PostgreSQL**: Primary relational database with schema-based multi-tenancy
- **MongoDB**: Document storage for chat messages and AI data --> I will not use in chat-service.
- **Redis**: Caching and session management with database-based partitioning (DB 0-15)
- **ScyllaDB**: High-performance database for chat service
- **RabbitMQ**: Message queue for inter-service communication

## Development Commands

### Environment Setup
```bash
# Start all infrastructure services
docker-compose up -d postgres mongodb redis scylladb rabbitmq

# Start all services including backends
docker-compose up -d

# View logs for specific service
docker-compose logs -f <service-name>

# Stop all services
docker-compose down

# Clean volumes (WARNING: destroys all data)
docker-compose down -v
```

### Java Services (user-service, contest-service)
```bash
# Build
./gradlew build

# Run tests
./gradlew test

# Run single test class
./gradlew test --tests "ClassName"

# Build Docker image
docker build -t contestapp-<service-name> .
```

### Erlang/OTP Chat Service
```bash
# From back/chat_service directory:
# Download dependencies and compile
./rebar3 get-deps
./rebar3 compile

# Start interactive shell
./rebar3 shell

# Build Docker image
docker build -t contestapp-chat-service .
```

### F# API Gateway
```bash
# From back/api-gateway directory:
# Build
dotnet build

# Run
dotnet run

# Build Docker image
docker build -t contestapp-api-gateway .
```

### Go Auth Server
```bash
# From back/auth-server directory:
# Build
go build -o auth-server

# Run
./auth-server

# Build Docker image
docker build -t contestapp-auth-server .
```

## Database Management

### Connection Details
- **PostgreSQL**: localhost:5432, user/a1234, database: contestapp
- **MongoDB**: localhost:27017, user/a1234, database: contestapp  
- **Redis**: localhost:6379, no password
- **ScyllaDB**: localhost:9042

### Database Schemas
PostgreSQL uses schema-based separation:
- `user_service`: Users, profiles, skills, follows
- `contest_service`: Contests, categories, participations
- `team_service`: Teams, members, applications
- `notification_service`: Notifications, settings
- `ai_service`: AI settings, recommendations

### Redis Database Allocation
- DB 0: Common system data
- DB 1: User sessions
- DB 2: User service cache
- DB 3: Contest service cache
- DB 4: Team service cache
- DB 5: AI service cache
- DB 6: Chat real-time data
- DB 7: Notification real-time data

## Testing

### Chat Service WebSocket Testing
Open `back/chat_service/test_chat.html` in browser to test WebSocket connections.

### Service Health Checks
- API Gateway: http://localhost:8080/
- User Service: http://localhost:8081/actuator/health
- Contest Service: http://localhost:8083/actuator/health
- Chat Service: http://localhost:8085/health
- Auth Server: http://localhost:60000/

## Important Files

### Configuration
- `docker-compose.yml`: Complete service orchestration
- `back/db/init-postgres.sql`: Database schema initialization
- `back/db/init-mongodb.js`: MongoDB collections setup
- `back/db/README.md`: Comprehensive database documentation

### Service Documentation
- `back/chat_service/README.md`: Chat service API and WebSocket protocol
- `chat_api_documentation.md`: Chat API specifications

## Inter-Service Communication

Services communicate via:
- HTTP REST APIs through the API Gateway
- RabbitMQ message queues for async operations
- Redis for shared session/cache data
- WebSocket connections for real-time chat

## Environment Variables

Services use these key environment variables:
- Database connections: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`
- Redis: `REDIS_HOST`, `REDIS_PORT`
- ScyllaDB: `SCYLLA_HOST`, `SCYLLA_PORT`
- JWT: `JWT_SECRET`
- Service ports: `PORT`

Check `docker-compose.yml` for complete environment configuration.

### Always Respond In Korean