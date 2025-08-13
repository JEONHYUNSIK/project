FROM openjdk:21-jdk-slim

WORKDIR /app

# Gradle Wrapper와 build 파일들 복사
COPY gradlew .
COPY gradle/ gradle/
COPY build.gradle .
COPY settings.gradle .

# 소스 코드 복사
COPY src/ src/

# 줄바꿈 문자 변환 및 실행 권한 부여
RUN apt-get update && apt-get install -y dos2unix && \
    dos2unix gradlew && \
    chmod +x gradlew && \
    rm -rf /var/lib/apt/lists/*

# 포트 노출
EXPOSE 8081

# bootRun으로 실행
CMD ["./gradlew", "bootRun"] 