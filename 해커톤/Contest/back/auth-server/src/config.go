package main

import (
	"os"
	"strconv"
)

// 데이터베이스 설정 구조체
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// Redis 설정 구조체
type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

// 서버 설정 구조체
type ServerConfig struct {
	Port      string
	JWTSecret []byte
}

// 환경변수에서 값 읽기 (기본값 포함)
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// 환경변수에서 정수 읽기
func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// 환경변수를 사용한 설정 값들
var (
	// 데이터베이스 설정
	DBConfig = DatabaseConfig{
		Host:     getEnv("DB_HOST", "contestapp-postgres"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "user"),
		Password: getEnv("DB_PASSWORD", "a1234"),
		DBName:   getEnv("DB_NAME", "contestapp"),
		SSLMode:  getEnv("DB_SSL_MODE", "disable"),
	}

	// Redis 설정
	RedisCfg = RedisConfig{
		Host:     getEnv("REDIS_HOST", "contestapp-redis"),
		Port:     getEnv("REDIS_PORT", "6379"),
		Password: getEnv("REDIS_PASSWORD", ""),
		DB:       getEnvInt("REDIS_DB", 0),
	}

	// 서버 설정
	ServerCfg = ServerConfig{
		Port:      getEnv("SERVER_PORT", "60000"),
		JWTSecret: []byte(getEnv("JWT_SECRET", "contestapp-super-secret-jwt-key-2024-auth-server")),
	}
)
