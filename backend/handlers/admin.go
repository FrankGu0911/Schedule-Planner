package handlers

import (
    "github.com/gin-gonic/gin"
    "net/http"
    "todolist/database"
    "todolist/models"
)

// GetUsers 获取用户列表
func GetUsers(c *gin.Context) {
    // 检查是否是管理员
    currentUser, _ := c.Get("user")
    if !currentUser.(*models.User).IsAdmin() {
        c.JSON(http.StatusForbidden, gin.H{"error": "无权限访问"})
        return
    }

    var users []models.User
    query := database.DB.Model(&models.User{})

    // 状态筛选
    if status := c.Query("status"); status != "" {
        query = query.Where("status = ?", status)
    }

    // 角色筛选
    if role := c.Query("role"); role != "" {
        query = query.Where("role = ?", role)
    }

    var total int64
    query.Count(&total)

    if err := query.Find(&users).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "获取用户列表失败"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "total": total,
        "users": users,
    })
}

// ActivateUser 激活用户
func ActivateUser(c *gin.Context) {
    // 检��是否是管理员
    currentUser, _ := c.Get("user")
    if !currentUser.(*models.User).IsAdmin() {
        c.JSON(http.StatusForbidden, gin.H{"error": "无权限访问"})
        return
    }

    userID := c.Param("id")
    var user models.User

    if err := database.DB.First(&user, userID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
        return
    }

    user.Status = models.StatusActive
    if err := database.DB.Save(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "激活用户失败"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "用户已激活",
        "user":    user,
    })
}

// BlockUser 禁用用户
func BlockUser(c *gin.Context) {
    // 检查是否是管理员
    currentUser, _ := c.Get("user")
    if !currentUser.(*models.User).IsAdmin() {
        c.JSON(http.StatusForbidden, gin.H{"error": "无权限访问"})
        return
    }

    userID := c.Param("id")
    var user models.User

    if err := database.DB.First(&user, userID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
        return
    }

    // 不能禁用管理员
    if user.IsAdmin() {
        c.JSON(http.StatusForbidden, gin.H{"error": "不能禁用管理员账号"})
        return
    }

    user.Status = models.StatusBlocked
    if err := database.DB.Save(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "禁用用户失败"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "用户已禁用",
        "user":    user,
    })
}

// UpdateUserRole 修改用户角色
func UpdateUserRole(c *gin.Context) {
    // 检查是否是管理员
    currentUser, _ := c.Get("user")
    if !currentUser.(*models.User).IsAdmin() {
        c.JSON(http.StatusForbidden, gin.H{"error": "无权限访问"})
        return
    }

    userID := c.Param("id")
    var user models.User
    var request models.UpdateUserRole

    if err := c.ShouldBindJSON(&request); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if err := database.DB.First(&user, userID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
        return
    }

    user.Role = request.Role
    if err := database.DB.Save(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "更新用户角色失败"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "用户角色已更新",
        "user":    user,
    })
}

// AdminUpdateUserPassword 管理员修改用户密码
func AdminUpdateUserPassword(c *gin.Context) {
    // 检查是否是管理员
    currentUser, _ := c.Get("user")
    if !currentUser.(*models.User).IsAdmin() {
        c.JSON(http.StatusForbidden, gin.H{"error": "无权限访问"})
        return
    }

    userID := c.Param("id")
    var user models.User
    var request models.AdminUpdateUserPassword

    if err := c.ShouldBindJSON(&request); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if err := database.DB.First(&user, userID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
        return
    }

    // 更新密码
    user.Password = request.Password
    if err := user.HashPassword(); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "密码加密失败"})
        return
    }

    if err := database.DB.Save(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "更新密码失败"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "密码修改成功",
        "user": gin.H{
            "id":       user.ID,
            "username": user.Username,
            "role":     user.Role,
            "status":   user.Status,
        },
    })
}

// DeleteUser 管理员删除用户
func DeleteUser(c *gin.Context) {
    // 检查是否是管理员
    currentUser, _ := c.Get("user")
    if !currentUser.(*models.User).IsAdmin() {
        c.JSON(http.StatusForbidden, gin.H{"error": "无权限访问"})
        return
    }

    userID := c.Param("id")
    var user models.User

    if err := database.DB.First(&user, userID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
        return
    }

    // 不能删除自己
    if user.ID == currentUser.(*models.User).ID {
        c.JSON(http.StatusForbidden, gin.H{"error": "不能删除自己的账号"})
        return
    }

    // 删除用户的所有待办事项
    if err := database.DB.Where("user_id = ?", user.ID).Delete(&models.Todo{}).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "删除用户待办事项失败"})
        return
    }

    // 删除用户
    if err := database.DB.Delete(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "删除用户失败"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "用户删除成功",
        "user": gin.H{
            "id":       user.ID,
            "username": user.Username,
            "role":     user.Role,
            "status":   user.Status,
        },
    })
} 