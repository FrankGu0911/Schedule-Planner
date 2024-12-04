package main

import (
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	"todolist/database"
	"todolist/handlers"
	"todolist/middleware"
)

func main() {
	// 初始化数据库
	database.InitDB()

	// 创建默认管理员账号
	if err := database.CreateDefaultAdmin(); err != nil {
		panic(err)
	}

	// 创建 Gin 引擎
	r := gin.Default()

	// 添加 CORS 中间件
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowCredentials = true
	config.AllowHeaders = []string{
		"Origin",
		"Content-Length",
		"Content-Type",
		"Authorization",
		"Accept",
		"X-Requested-With",
		"Access-Control-Allow-Origin",
		"Access-Control-Allow-Headers",
		"Access-Control-Allow-Methods",
	}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	config.ExposeHeaders = []string{"Content-Length"}
	r.Use(cors.New(config))

	// 使用日志中间件
	r.Use(middleware.Logger())

	// 路由组
	v1 := r.Group("/api/v1")
	{
		// 用户相关路由
		auth := v1.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
			auth.PUT("/password", middleware.AuthMiddleware(), handlers.UpdatePassword)
		}

		// 管理员路由（需要认证和管理员权限）
		admin := v1.Group("/admin")
		admin.Use(middleware.AuthMiddleware())
		{
			admin.GET("/users", handlers.GetUsers)
			admin.POST("/users/:id/activate", handlers.ActivateUser)
			admin.POST("/users/:id/block", handlers.BlockUser)
			admin.PUT("/users/:id/role", handlers.UpdateUserRole)
			admin.PUT("/users/:id/password", handlers.AdminUpdateUserPassword)
		}

		// Todo相关路由（需要认证）
		todos := v1.Group("/todos")
		todos.Use(middleware.AuthMiddleware())
		{
			todos.POST("", handlers.CreateTodo)
			todos.GET("", handlers.GetTodos)
			todos.GET("/:id", handlers.GetTodo)
			todos.PUT("/:id", handlers.UpdateTodo)
			todos.DELETE("/:id", handlers.DeleteTodo)
		}
	}

	// 启动服务器
	if err := r.Run("0.0.0.0:8080"); err != nil {
		panic(err)
	}
} 