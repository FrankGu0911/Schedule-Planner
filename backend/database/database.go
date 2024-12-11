package database

import (
    "gorm.io/gorm"
    "github.com/glebarez/sqlite"
    "todolist/models"
)

var DB *gorm.DB

func InitDB() {
    var err error
    DB, err = gorm.Open(sqlite.Open("backend/data/todo.db"), &gorm.Config{})
    if err != nil {
        panic("failed to connect database")
    }

    // 自动迁移
    err = DB.AutoMigrate(&models.User{}, &models.Todo{})
    if err != nil {
        panic("failed to migrate database")
    }

    // 添加last_active字段（如果不存在）
    if !DB.Migrator().HasColumn(&models.User{}, "last_active") {
        err = DB.Migrator().AddColumn(&models.User{}, "last_active")
        if err != nil {
            panic("failed to add last_active column")
        }
    }
} 