package database

import (
    "todolist/models"
)

// CreateDefaultAdmin 创建默认管理员账号
func CreateDefaultAdmin() error {
    var count int64
    DB.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&count)
    if count == 0 {
        admin := &models.User{
            Username: "admin",
            Password: "123456",
            Role:     models.RoleAdmin,
            Status:   models.StatusActive,
        }
        if err := admin.HashPassword(); err != nil {
            return err
        }
        return DB.Create(admin).Error
    }
    return nil
} 