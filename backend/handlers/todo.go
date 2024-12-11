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

	// 使用新的转换方法创建todo
	todo := request.ToTodo(userID.(uint))

	if err := database.DB.Create(todo).Error; err != nil {
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
		if t, err := time.Parse(models.TimeFormat, startTime); err == nil {
			query = query.Where("start_time >= ?", t)
		}
	}
	
	if endTime := c.Query("end_time"); endTime != "" {
		if t, err := time.Parse(models.TimeFormat, endTime); err == nil {
			query = query.Where("end_time <= ?", t)
		}
	}

	// 长期任务筛选
	if isLongTerm := c.Query("is_long_term"); isLongTerm != "" {
		query = query.Where("is_long_term = ?", isLongTerm == "true")
	}

	// 星标任务筛选
	if isStarred := c.Query("is_starred"); isStarred != "" {
		query = query.Where("is_starred = ?", isStarred == "true")
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

	// 使用新的更新方法
	request.UpdateTodo(&todo)

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