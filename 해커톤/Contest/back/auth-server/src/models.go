package main

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWT Claims 구조체
type Claims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// User 구조체 (기존 ContestApp DB 구조에 맞게 수정)
type User struct {
	ID              string    `json:"id"`
	Username        string    `json:"username"`
	Password        string    `json:"password"`
	Email           string    `json:"email"`
	PhoneNumber     *string   `json:"phone_number"`
	IsPhoneVerified bool      `json:"is_phone_verified"`
	IsActive        bool      `json:"is_active"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// TokenInfo 구조체 (Redis 토큰 정보용)
type TokenInfo struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
}

// RefreshTokenInfo 구조체 (Refresh Token 정보용)
type RefreshTokenInfo struct {
	UserID     string `json:"user_id"`
	Username   string `json:"username"`
	Email      string `json:"email"`
	FamilyID   string `json:"family_id"`
	IssuedAt   int64  `json:"issued_at"`
	ExpiresAt  int64  `json:"expires_at"`
	IsActive   bool   `json:"is_active"`
}

// TokenPair 구조체 (Access + Refresh Token 쌍)
type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}
