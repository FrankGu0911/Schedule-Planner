package models

import (
    "time"
)

const (
    TimeFormat = "2006-01-02 15:04:05"
)

type CustomTime struct {
    time.Time
}

// MarshalJSON 自定义时间格式的JSON序列化
func (t CustomTime) MarshalJSON() ([]byte, error) {
    if t.Time.IsZero() {
        return []byte("null"), nil
    }
    formatted := t.Time.Format(TimeFormat)
    return []byte(`"` + formatted + `"`), nil
}

// UnmarshalJSON 自定义时间格式的JSON反序列化
func (t *CustomTime) UnmarshalJSON(data []byte) error {
    if string(data) == "null" {
        t.Time = time.Time{}
        return nil
    }
    // 去掉引号
    str := string(data)[1 : len(data)-1]
    parsed, err := time.ParseInLocation(TimeFormat, str, time.Local)
    if err != nil {
        return err
    }
    t.Time = parsed
    return nil
}

type Todo struct {
    ID          uint       `json:"id" gorm:"primarykey"`
    Title       string     `json:"title" binding:"required" gorm:"not null"`
    Description string     `json:"description"`
    Completed   bool       `json:"completed" gorm:"default:false"`
    IsLongTerm  bool       `json:"is_long_term" gorm:"default:false"`
    UserID      uint       `json:"user_id" gorm:"not null"`
    StartTime   CustomTime `json:"start_time" gorm:"type:datetime;default:CURRENT_TIMESTAMP"`
    EndTime     CustomTime `json:"end_time" gorm:"type:datetime;default:CURRENT_TIMESTAMP"`
    Tags        []string   `json:"tags" gorm:"type:json"`
    CreatedAt   time.Time  `json:"created_at"`
    UpdatedAt   time.Time  `json:"updated_at"`
}

// BeforeCreate 在创建记录前设置默认值
func (t *Todo) BeforeCreate() error {
    // 如果开始时间为空，设置为当前时间
    if t.StartTime.IsZero() {
        t.StartTime = CustomTime{time.Now()}
    }
    
    // 如果结束时间为空，设置为开始时间后24小时
    if t.EndTime.IsZero() {
        t.EndTime = CustomTime{t.StartTime.Add(24 * time.Hour)}
    }
    
    return nil
}

type CreateTodoRequest struct {
    Title       string     `json:"title" binding:"required"`
    Description string     `json:"description"`
    IsLongTerm  *bool      `json:"is_long_term,omitempty"` // 使用指针类型，可以判断是否提供了该字段
    StartTime   *CustomTime `json:"start_time,omitempty"`   // 使用指针类型，可以判断是否提供了该字段
    EndTime     *CustomTime `json:"end_time,omitempty"`     // 使用指针类型，可以判断是否提供了该字段
    Tags        []string   `json:"tags"`
}

// ToTodo 将请求转换为Todo模型，并设置默认值
func (r *CreateTodoRequest) ToTodo(userID uint) *Todo {
    todo := &Todo{
        Title:       r.Title,
        Description: r.Description,
        UserID:      userID,
        Tags:        r.Tags,
    }

    // 设置是否为长期任务的默认值
    if r.IsLongTerm != nil {
        todo.IsLongTerm = *r.IsLongTerm
    }

    // 设置开始时间
    if r.StartTime != nil {
        todo.StartTime = *r.StartTime
    }

    // 设置结束时间
    if r.EndTime != nil {
        todo.EndTime = *r.EndTime
    }

    return todo
}

type UpdateTodoRequest struct {
    Title       string      `json:"title"`
    Description string      `json:"description"`
    Completed   *bool       `json:"completed,omitempty"`
    IsLongTerm  *bool       `json:"is_long_term,omitempty"`
    StartTime   *CustomTime `json:"start_time,omitempty"`
    EndTime     *CustomTime `json:"end_time,omitempty"`
    Tags        []string    `json:"tags"`
}

// UpdateTodo 更新Todo模型
func (r *UpdateTodoRequest) UpdateTodo(todo *Todo) {
    if r.Title != "" {
        todo.Title = r.Title
    }
    if r.Description != "" {
        todo.Description = r.Description
    }
    if r.Completed != nil {
        todo.Completed = *r.Completed
    }
    if r.IsLongTerm != nil {
        todo.IsLongTerm = *r.IsLongTerm
    }
    if r.StartTime != nil {
        todo.StartTime = *r.StartTime
    }
    if r.EndTime != nil {
        todo.EndTime = *r.EndTime
    }
    if r.Tags != nil {
        todo.Tags = r.Tags
    }
} 