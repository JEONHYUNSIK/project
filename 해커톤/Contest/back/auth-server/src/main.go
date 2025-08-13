package main

import (
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// 데이터베이스 초기화
	initDB()
	defer db.Close()

	// Redis 초기화
	initRedis()
	defer rdb.Close()

	// Gin 모드 설정
	gin.SetMode(gin.ReleaseMode)

	router := gin.Default()

	// CORS 미들웨어 수정
	router.Use(func(c *gin.Context) {
		// 요청의 Origin 헤더를 동적으로 허용
		origin := c.GetHeader("Origin")
		c.Header("Access-Control-Allow-Origin", origin)
		// }

		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie") // Cookie 헤더 허용
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// 라우트 설정
	auth := router.Group("/auth")
	{
		auth.POST("/login", loginHandler)
		auth.POST("/logout", logoutHandler)
		auth.POST("/verify", verifyHandler)
		auth.POST("/refresh", refreshHandler)
		auth.POST("/register", registerHandler)
	}

	// 서버 시작
	log.Printf("Auth Server starting on port %s", ServerCfg.Port)
	log.Fatal(router.Run(":" + ServerCfg.Port))
}
