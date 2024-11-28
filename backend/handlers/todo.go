package handlers

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"todolist/database"
	"todolist/models"
	"time"
)

// CreateTodo 创建待办事项
func CreateTodo(c *gin.Context) {
	userID, _ := c.Get("userID")
	var request models.CreateTodoRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	todo := models.Todo{
		Title:       request.Title,
		Description: request.Description,
		UserID:      userID.(uint),
		StartTime:   request.StartTime,
		EndTime:     request.EndTime,
		Tags:        request.Tags,
	}

	if err := database.DB.Create(&todo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建待办事项失败"})
		return
	}

	c.JSON(http.StatusCreated, todo)
}

// GetTodos 获取所有待办事项
func GetTodos(c *gin.Context) {
	userID, _ := c.Get("userID")
	var todos []models.Todo
	
	// 构建查询
	query := database.DB.Where("user_id = ?", userID)
	
	// 标签筛选
	if tag := c.Query("tag"); tag != "" {
		query = query.Where("JSON_CONTAINS(tags, ?)", tag)
	}
	
	// 时间范围筛选
	if startTime := c.Query("start_time"); startTime != "" {
		if t, err := time.Parse(time.RFC3339, startTime); err == nil {
			query = query.Where("start_time >= ?", t)
		}
	}
	
	if endTime := c.Query("end_time"); endTime != "" {
		if t, err := time.Parse(time.RFC3339, endTime); err == nil {
			query = query.Where("end_time <= ?", t)
		}
	}

	if err := query.Find(&todos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取待办事项失败"})
		return
	}

	c.JSON(http.StatusOK, todos)
}

// GetTodo 获取单个待办事项
func GetTodo(c *gin.Context) {
	userID, _ := c.Get("userID")
	id := c.Param("id")
	var todo models.Todo

	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&todo).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "待办事项不存在"})
		return
	}

	c.JSON(http.StatusOK, todo)
}

// UpdateTodo 更新待办事项
func UpdateTodo(c *gin.Context) {
	userID, _ := c.Get("userID")
	id := c.Param("id")
	var todo models.Todo
	var request models.UpdateTodoRequest

	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&todo).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "待办事项不存在"})
		return
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if request.Title != "" {
		todo.Title = request.Title
	}
	todo.Description = request.Description
	todo.Completed = request.Completed
	todo.StartTime = request.StartTime
	todo.EndTime = request.EndTime
	todo.Tags = request.Tags

	if err := database.DB.Save(&todo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新待办事项失败"})
		return
	}

	c.JSON(http.StatusOK, todo)
}

// DeleteTodo 删除待办事项
func DeleteTodo(c *gin.Context) {
	userID, _ := c.Get("userID")
	id := c.Param("id")
	var todo models.Todo

	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&todo).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "待办事项不存在"})
		return
	}

	if err := database.DB.Delete(&todo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除待办事项失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
} 