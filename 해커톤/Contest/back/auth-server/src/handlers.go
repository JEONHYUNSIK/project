package main

import (
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// 로그인 핸들러
func loginHandler(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// 데이터베이스에서 사용자 조회
	user, err := getUserByUsername(req.Username)
	if err != nil {
		log.Printf("User lookup failed: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// 비밀번호 검증
	if !checkPassword(user.Password, req.Password) {
		log.Printf("Password check failed for user: %s", req.Username)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Family ID 생성
	familyID, err := generateFamilyID()
	if err != nil {
		log.Printf("Family ID generation failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate family ID"})
		return
	}

	// JWT Access Token + Refresh Token 쌍 생성
	tokenPair, err := generateTokenPair(user.ID, user.Username, familyID)
	if err != nil {
		log.Printf("Token pair generation failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token pair"})
		return
	}

	// Redis에 토큰 쌍 저장
	err = storeTokenPairInRedis(tokenPair, user.ID, user.Username, user.Email, familyID)
	if err != nil {
		log.Printf("Failed to store token pair in Redis: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store token pair"})
		return
	}

	// 쿠키로 토큰 설정
	c.SetCookie("auth_token", tokenPair.AccessToken, 3600, "/", "", false, true)        // 1시간, HttpOnly
	c.SetCookie("refresh_token", tokenPair.RefreshToken, 3600*24*180, "/", "", false, true) // 180일, HttpOnly

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

// 로그아웃 핸들러
func logoutHandler(c *gin.Context) {
	// 쿠키에서 access token 가져오기
	accessToken, err := c.Cookie("auth_token")
	if err == nil {
		// Redis에서 access token 무효화
		if err := revokeTokenInRedis(accessToken); err != nil {
			log.Printf("Failed to revoke access token in Redis: %v", err)
		}
	}

	// 쿠키에서 refresh token 가져오기
	refreshToken, err := c.Cookie("refresh_token")
	if err == nil {
		// Refresh token 정보 조회해서 family ID 얻기
		refreshTokenInfo, err := validateRefreshTokenFromRedis(refreshToken)
		if err == nil {
			// 토큰 패밀리 전체 무효화 (모든 디바이스에서 로그아웃)
			if err := revokeTokenFamilyInRedis(refreshTokenInfo.FamilyID); err != nil {
				log.Printf("Failed to revoke token family in Redis: %v", err)
			}
		} else {
			// 단일 refresh token만 무효화
			if err := revokeRefreshTokenInRedis(refreshToken); err != nil {
				log.Printf("Failed to revoke refresh token in Redis: %v", err)
			}
		}
	}

	// 쿠키 만료시키기
	c.SetCookie("auth_token", "", -1, "/", "", false, true)
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Logout successful"})
}

// 토큰 검증 핸들러 (API Gateway용)
func verifyHandler(c *gin.Context) {
	log.Printf("Token verification request received")

	// 쿠키에서 토큰 가져오기
	token, err := c.Cookie("auth_token")
	if err != nil {
		log.Printf("No token in cookie, checking Authorization header")
		// Authorization 헤더에서도 확인
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			log.Printf("No token provided in cookie or header")
			c.JSON(http.StatusUnauthorized, gin.H{"valid": false, "error": "No token provided"})
			return
		}

		// Bearer 토큰 형식 확인
		if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			token = authHeader[7:]
			log.Printf("Token found in Authorization header")
		} else {
			log.Printf("Invalid token format in Authorization header")
			c.JSON(http.StatusUnauthorized, gin.H{"valid": false, "error": "Invalid token format"})
			return
		}
	} else {
		log.Printf("Token found in cookie")
	}

	log.Printf("Token to verify: %s...", token[:min(len(token), 20)]) // 처음 20자만 로그

	// 1. JWT 토큰 검증 (서명, 만료시간 등)
	_, err = validateJWT(token)
	if err != nil {
		log.Printf("JWT validation failed: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"valid": false, "error": "Invalid JWT token"})
		return
	}

	log.Printf("JWT validation successful")

	// 2. Redis에서 토큰 상태 확인
	tokenInfo, err := validateTokenFromRedis(token)
	if err != nil {
		log.Printf("Redis token validation failed: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"valid": false, "error": "Token not found or revoked"})
		return
	}

	log.Printf("Token verification successful for user: %s", tokenInfo.Username)

	c.JSON(http.StatusOK, gin.H{
		"valid": true,
		"user": gin.H{
			"id":       tokenInfo.UserID,
			"username": tokenInfo.Username,
			"email":    tokenInfo.Email,
		},
	})
}

// min 헬퍼 함수
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// 토큰 갱신 핸들러 (Refresh Token Rotation)
func refreshHandler(c *gin.Context) {
	log.Printf("Token refresh request received")

	// 쿠키에서 refresh token 가져오기
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil {
		log.Printf("No refresh token provided")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No refresh token provided"})
		return
	}

	log.Printf("Validating refresh token: %s...", refreshToken[:min(len(refreshToken), 10)])

	// Refresh Token 검증
	refreshTokenInfo, err := validateRefreshTokenFromRedis(refreshToken)
	if err != nil {
		log.Printf("Refresh token validation failed: %v", err)
		// 보안 위반 가능성 - 패밀리 전체 무효화
		if refreshTokenInfo != nil && refreshTokenInfo.FamilyID != "" {
			revokeTokenFamilyInRedis(refreshTokenInfo.FamilyID)
			log.Printf("Security breach detected - revoked token family: %s", refreshTokenInfo.FamilyID)
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	log.Printf("Refresh token valid for user: %s, family: %s", refreshTokenInfo.Username, refreshTokenInfo.FamilyID)

	// 기존 refresh token 무효화 (rotation)
	if err := revokeRefreshTokenInRedis(refreshToken); err != nil {
		log.Printf("Failed to revoke old refresh token: %v", err)
	}

	// 새로운 토큰 쌍 생성 (같은 family ID 사용)
	newTokenPair, err := generateTokenPair(refreshTokenInfo.UserID, refreshTokenInfo.Username, refreshTokenInfo.FamilyID)
	if err != nil {
		log.Printf("Failed to generate new token pair: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate new tokens"})
		return
	}

	// 새로운 토큰 쌍을 Redis에 저장
	err = storeTokenPairInRedis(newTokenPair, refreshTokenInfo.UserID, refreshTokenInfo.Username, refreshTokenInfo.Email, refreshTokenInfo.FamilyID)
	if err != nil {
		log.Printf("Failed to store new token pair: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store new tokens"})
		return
	}

	// 새로운 토큰들을 쿠키로 설정
	c.SetCookie("auth_token", newTokenPair.AccessToken, 3600, "/", "", false, true)        // 1시간
	c.SetCookie("refresh_token", newTokenPair.RefreshToken, 3600*24*180, "/", "", false, true) // 180일

	log.Printf("Token refresh successful for user: %s", refreshTokenInfo.Username)

	c.JSON(http.StatusOK, gin.H{
		"message": "Tokens refreshed successfully",
		"user": gin.H{
			"id":       refreshTokenInfo.UserID,
			"username": refreshTokenInfo.Username,
			"email":    refreshTokenInfo.Email,
		},
	})
}

// 회원가입 핸들러
func registerHandler(c *gin.Context) {
	var req struct {
		Username 		string `json:"username" binding:"required"`
		Password 		string `json:"password" binding:"required"`
		Email    		string `json:"email" binding:"required"`
		PhoneNumber    	string `json:"phone_number" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// 입력값 검증
	req.Username = strings.TrimSpace(req.Username)
	req.Email = strings.TrimSpace(req.Email)

	if len(req.Username) < 3 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username must be at least 3 characters"})
		return
	}

	if len(req.Password) < 4 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password must be at least 4 characters"})
		return
	}

	if !strings.Contains(req.Email, "@") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
		return
	}

	// 사용자명 중복 체크
	exists, err := checkUserExists(req.Username)
	if err != nil {
		log.Printf("Error checking user existence: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check user existence"})
		return
	}

	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	// 새 사용자 생성
	user, err := createUser(req.Username, req.Password, req.Email, req.PhoneNumber)
	if err != nil {
		log.Printf("User creation failed: %v", err)
		if strings.Contains(err.Error(), "duplicate key") {
			c.JSON(http.StatusConflict, gin.H{"error": "Username or email already exists"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"phone_number":    user.PhoneNumber,
		},
	})
}
