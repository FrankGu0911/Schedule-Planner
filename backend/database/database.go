package database

import (
    "log"
    "gorm.io/gorm"
    "github.com/glebarez/sqlite"
    "todolist/models"
)

var DB *gorm.DB

func InitDB() {
    var err error
    DB, err = gorm.Open(sqlite.Open("backend/data/todo.db"), &gorm.Config{})
    if err != nil {
        log.Fatal("数据库连接失败:", err)
    }

    // 自动迁移数据库结构
    err = DB.AutoMigrate(&models.User{}, &models.Todo{})
    if err != nil {
        log.Fatal("数据库迁移失败:", err)
    }
} 