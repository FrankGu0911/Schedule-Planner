package models

import (
    "time"
)

type Todo struct {
    ID          uint      `json:"id" gorm:"primarykey"`
    Title       string    `json:"title" binding:"required" gorm:"not null"`
    Description string    `json:"description"`
    Completed   bool      `json:"completed" gorm:"default:false"`
    UserID      uint      `json:"user_id" gorm:"not null"`
    StartTime   *time.Time `json:"start_time"`
    EndTime     *time.Time `json:"end_time"`
    Tags        []string   `json:"tags" gorm:"type:json"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}

type CreateTodoRequest struct {
    Title       string    `json:"title" binding:"required"`
    Description string    `json:"description"`
    StartTime   *time.Time `json:"start_time"`
    EndTime     *time.Time `json:"end_time"`
    Tags        []string   `json:"tags"`
}

type UpdateTodoRequest struct {
    Title       string    `json:"title"`
    Description string    `json:"description"`
    Completed   bool      `json:"completed"`
    StartTime   *time.Time `json:"start_time"`
    EndTime     *time.Time `json:"end_time"`
    Tags        []string   `json:"tags"`
} 