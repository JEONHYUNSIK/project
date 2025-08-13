package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
)

var (
	db  *sql.DB
	rdb *redis.Client
	ctx = context.Background()
)

// 데이터베이스 초기화
func initDB() {
	// PostgreSQL 연결 문자열
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		DBConfig.Host, DBConfig.Port, DBConfig.User, DBConfig.Password, DBConfig.DBName, DBConfig.SSLMode)

	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// 연결 테스트
	if err = db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	log.Println("Successfully connected to PostgreSQL database")
}

// Redis 초기화
func initRedis() {
	rdb = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", RedisCfg.Host, RedisCfg.Port),
		Password: RedisCfg.Password,
		DB:       RedisCfg.DB,
	})

	// 연결 테스트
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Fatal("Failed to connect to Redis:", err)
	}

	log.Println("Successfully connected to Redis")
}

// 데이터베이스에서 사용자 조회
func getUserByUsername(username string) (*User, error) {
	user := &User{}
	query := `SELECT id, username, password, email, phone_number, is_phone_verified, is_active, created_at, updated_at 
			  FROM user_service.users WHERE username = $1 AND is_active = true`

	err := db.QueryRow(query, username).Scan(
		&user.ID, &user.Username, &user.Password, &user.Email, &user.PhoneNumber,
		&user.IsPhoneVerified, &user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}

// 비밀번호 검증
func checkPassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

// 새 사용자 생성
func createUser(username, password, email, PhoneNumber string) (*User, error) {
	// 비밀번호 해싱
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return nil, err
	}

	// 데이터베이스에 사용자 삽입
	var userID string
	query := `INSERT INTO user_service.users (username, password, email, phone_number) VALUES ($1, $2, $3, $4) RETURNING id`
	err = db.QueryRow(query, username, string(hashedPassword), email, PhoneNumber).Scan(&userID)
	if err != nil {
		return nil, err
	}

	// 생성된 사용자 정보 반환
	user := &User{
		ID:              userID,
		Username:        username,
		Password:        string(hashedPassword),
		Email:           email,
		PhoneNumber:     nil,
		IsPhoneVerified: false,
		IsActive:        true,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	return user, nil
}

// 사용자명 중복 체크
func checkUserExists(username string) (bool, error) {
	var count int
	query := `SELECT COUNT(*) FROM user_service.users WHERE username = $1`
	err := db.QueryRow(query, username).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// Redis에 토큰 저장
func storeTokenInRedis(token string, userID string, username, email string) error {
	tokenInfo := map[string]interface{}{
		"user_id":    userID,
		"username":   username,
		"email":      email,
		"issued_at":  time.Now().Unix(),
		"expires_at": time.Now().Add(24 * time.Hour).Unix(),
		"is_active":  "true", // 문자열로 저장
	}

	redisKey := "token:" + token

	log.Printf("Storing token in Redis: key=%s, user_id=%s, username=%s", redisKey, userID, username)

	// Redis에 토큰 정보 저장
	err := rdb.HMSet(ctx, redisKey, tokenInfo).Err()
	if err != nil {
		log.Printf("Failed to store token in Redis: %v", err)
		return err
	}

	// TTL 설정 (24시간)
	err = rdb.Expire(ctx, redisKey, 24*time.Hour).Err()
	if err != nil {
		log.Printf("Failed to set TTL for token: %v", err)
		return err
	}

	log.Printf("Token stored successfully in Redis: %s", redisKey)
	return nil
}

// Redis에서 토큰 검증
func validateTokenFromRedis(token string) (*TokenInfo, error) {
	redisKey := "token:" + token

	log.Printf("Validating token from Redis: key=%s", redisKey)

	// Redis에서 토큰 정보 조회
	result, err := rdb.HGetAll(ctx, redisKey).Result()
	if err != nil {
		log.Printf("Redis HGetAll error: %v", err)
		return nil, err
	}

	log.Printf("Redis result: %+v", result)

	if len(result) == 0 {
		log.Printf("Token not found in Redis: %s", redisKey)
		return nil, fmt.Errorf("token not found")
	}

	// 토큰 활성 상태 확인
	if result["is_active"] != "true" {
		log.Printf("Token has been revoked: is_active=%s", result["is_active"])
		return nil, fmt.Errorf("token has been revoked")
	}

	// 만료 시간 확인
	expiresAtUnix := parseInt64(result["expires_at"])
	expiresAt := time.Unix(expiresAtUnix, 0)

	log.Printf("Token expires at: %s, current time: %s", expiresAt, time.Now())

	if time.Now().After(expiresAt) {
		log.Printf("Token expired")
		return nil, fmt.Errorf("token expired")
	}

	// 사용자 정보 반환
	tokenInfo := &TokenInfo{
		UserID:   result["user_id"],
		Username: result["username"],
		Email:    result["email"],
	}

	log.Printf("Token validation successful: user_id=%s, username=%s", tokenInfo.UserID, tokenInfo.Username)
	return tokenInfo, nil
}

// Redis에서 토큰 무효화
func revokeTokenInRedis(token string) error {
	redisKey := "token:" + token
	return rdb.HSet(ctx, redisKey, "is_active", false).Err()
}

// 문자열을 정수로 변환
func parseInt(s string) int {
	var i int
	fmt.Sscanf(s, "%d", &i)
	return i
}

// 문자열을 int64로 변환
func parseInt64(s string) int64 {
	var i int64
	fmt.Sscanf(s, "%d", &i)
	return i
}

// Refresh Token을 Redis에 저장
func storeRefreshTokenInRedis(refreshToken string, userID string, username string, email string, familyID string) error {
	refreshTokenInfo := map[string]interface{}{
		"user_id":     userID,
		"username":    username,
		"email":       email,
		"family_id":   familyID,
		"issued_at":   time.Now().Unix(),
		"expires_at":  time.Now().Add(180 * 24 * time.Hour).Unix(), // 180일
		"is_active":   "true",
	}

	redisKey := "refresh_token:" + refreshToken

	log.Printf("Storing refresh token in Redis: key=%s, user_id=%s, family_id=%s", redisKey, userID, familyID)

	// Redis에 refresh token 정보 저장
	err := rdb.HMSet(ctx, redisKey, refreshTokenInfo).Err()
	if err != nil {
		log.Printf("Failed to store refresh token in Redis: %v", err)
		return err
	}

	// TTL 설정 (180일)
	err = rdb.Expire(ctx, redisKey, 180*24*time.Hour).Err()
	if err != nil {
		log.Printf("Failed to set TTL for refresh token: %v", err)
		return err
	}

	// 토큰 패밀리에 추가
	familyKey := "token_family:" + familyID
	err = rdb.SAdd(ctx, familyKey, refreshToken).Err()
	if err != nil {
		log.Printf("Failed to add refresh token to family: %v", err)
		return err
	}

	// 패밀리 TTL 설정 (180일)
	err = rdb.Expire(ctx, familyKey, 180*24*time.Hour).Err()
	if err != nil {
		log.Printf("Failed to set TTL for token family: %v", err)
		return err
	}

	log.Printf("Refresh token stored successfully in Redis: %s", redisKey)
	return nil
}

// Redis에서 Refresh Token 검증
func validateRefreshTokenFromRedis(refreshToken string) (*RefreshTokenInfo, error) {
	redisKey := "refresh_token:" + refreshToken

	log.Printf("Validating refresh token from Redis: key=%s", redisKey)

	// Redis에서 refresh token 정보 조회
	result, err := rdb.HGetAll(ctx, redisKey).Result()
	if err != nil {
		log.Printf("Redis HGetAll error: %v", err)
		return nil, err
	}

	if len(result) == 0 {
		log.Printf("Refresh token not found in Redis: %s", redisKey)
		return nil, fmt.Errorf("refresh token not found")
	}

	// 토큰 활성 상태 확인
	if result["is_active"] != "true" {
		log.Printf("Refresh token has been revoked: is_active=%s", result["is_active"])
		return nil, fmt.Errorf("refresh token has been revoked")
	}

	// 만료 시간 확인
	expiresAtUnix := parseInt64(result["expires_at"])
	expiresAt := time.Unix(expiresAtUnix, 0)

	log.Printf("Refresh token expires at: %s, current time: %s", expiresAt, time.Now())

	if time.Now().After(expiresAt) {
		log.Printf("Refresh token expired")
		return nil, fmt.Errorf("refresh token expired")
	}

	// Refresh Token 정보 반환
	refreshTokenInfo := &RefreshTokenInfo{
		UserID:    result["user_id"],
		Username:  result["username"],
		Email:     result["email"],
		FamilyID:  result["family_id"],
		IssuedAt:  parseInt64(result["issued_at"]),
		ExpiresAt: expiresAtUnix,
		IsActive:  true,
	}

	log.Printf("Refresh token validation successful: user_id=%s, family_id=%s", refreshTokenInfo.UserID, refreshTokenInfo.FamilyID)
	return refreshTokenInfo, nil
}

// Redis에서 Refresh Token 무효화
func revokeRefreshTokenInRedis(refreshToken string) error {
	redisKey := "refresh_token:" + refreshToken
	return rdb.HSet(ctx, redisKey, "is_active", false).Err()
}

// 토큰 패밀리의 모든 토큰 무효화 (보안 위반 시)
func revokeTokenFamilyInRedis(familyID string) error {
	familyKey := "token_family:" + familyID

	// 패밀리의 모든 refresh token 조회
	tokens, err := rdb.SMembers(ctx, familyKey).Result()
	if err != nil {
		return err
	}

	// 각 토큰 무효화
	for _, token := range tokens {
		if err := revokeRefreshTokenInRedis(token); err != nil {
			log.Printf("Failed to revoke token %s: %v", token, err)
		}
	}

	// 패밀리 삭제
	return rdb.Del(ctx, familyKey).Err()
}

// Access Token + Refresh Token 쌍을 Redis에 저장
func storeTokenPairInRedis(tokenPair *TokenPair, userID string, username string, email string, familyID string) error {
	// Access Token 저장 (기존 방식)
	err := storeTokenInRedis(tokenPair.AccessToken, userID, username, email)
	if err != nil {
		return err
	}

	// Refresh Token 저장
	err = storeRefreshTokenInRedis(tokenPair.RefreshToken, userID, username, email, familyID)
	if err != nil {
		return err
	}

	return nil
}
