package models

import (
    "time"
)

type Todo struct {
    ID          uint        `json:"id" gorm:"primarykey"`
    Title       string      `json:"title" binding:"required" gorm:"not null"`
    Description string      `json:"description"`
    Completed   bool        `json:"completed" gorm:"default:false"`
    CompletedAt *CustomTime `json:"completed_at,omitempty" gorm:"type:datetime"`
    IsLongTerm  bool        `json:"is_long_term" gorm:"default:false"`
    UserID      uint        `json:"user_id" gorm:"not null"`
    StartTime   CustomTime  `json:"start_time" gorm:"type:datetime;default:CURRENT_TIMESTAMP"`
    EndTime     *CustomTime `json:"end_time,omitempty" gorm:"type:datetime"`
    Tags        StringSlice `json:"tags" gorm:"type:text"`
    CreatedAt   CustomTime  `json:"created_at"`
    UpdatedAt   CustomTime  `json:"updated_at"`
}

// BeforeCreate 在创建记录前设置默认值
func (t *Todo) BeforeCreate() error {
    // 如果开始时间为空，设置为当前时间
    if t.StartTime.IsZero() {
        t.StartTime = CustomTime{time.Now()}
    }
    
    // 如果不��长期任务且结束时间为空，设置为开始时间后24小时
    if !t.IsLongTerm && t.EndTime == nil {
        endTime := CustomTime{t.StartTime.Add(24 * time.Hour)}
        t.EndTime = &endTime
    }
    
    return nil
}

// BeforeSave 在保存记录前处理完成时间
func (t *Todo) BeforeSave() error {
    if t.Completed && t.CompletedAt == nil {
        now := CustomTime{time.Now()}
        t.CompletedAt = &now
    } else if !t.Completed {
        t.CompletedAt = nil
    }

    // 如果是长期任务，允许结束时间为空
    if t.IsLongTerm {
        // 如果提供了空字符串或null，则设置为nil
        if t.EndTime != nil && t.EndTime.IsZero() {
            t.EndTime = nil
        }
    } else {
        // 如果不是长期任务且结束时间为空，设置为开始时间后24小时
        if t.EndTime == nil {
            endTime := CustomTime{t.StartTime.Add(24 * time.Hour)}
            t.EndTime = &endTime
        }
    }
    return nil
}

type CreateTodoRequest struct {
    Title       string      `json:"title" binding:"required"`
    Description string      `json:"description"`
    IsLongTerm  *CustomBool `json:"is_long_term,omitempty"`
    StartTime   *CustomTime `json:"start_time,omitempty"`
    EndTime     *CustomTime `json:"end_time,omitempty"`
    Tags        []string    `json:"tags"`
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
        todo.IsLongTerm = bool(*r.IsLongTerm)
    }

    // 设置开始时间
    if r.StartTime != nil {
        todo.StartTime = *r.StartTime
    }

    // 设置结束时间
    if r.EndTime != nil && !r.EndTime.IsZero() {
        todo.EndTime = r.EndTime
    }

    return todo
}

type UpdateTodoRequest struct {
    Title       string      `json:"title"`
    Description string      `json:"description"`
    Completed   *bool       `json:"completed,omitempty"`
    IsLongTerm  *CustomBool `json:"is_long_term,omitempty"`
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
        todo.IsLongTerm = bool(*r.IsLongTerm)
    }
    if r.StartTime != nil {
        todo.StartTime = *r.StartTime
    }
    if r.EndTime != nil {
        if r.EndTime.IsZero() {
            // 如果提供了空的结束时间
            if todo.IsLongTerm {
                todo.EndTime = nil // 长期任务允许结束时间为空
            } else {
                endTime := CustomTime{todo.StartTime.Add(24 * time.Hour)}
                todo.EndTime = &endTime // 非长期任务设置为开始时间后24小时
            }
        } else {
            todo.EndTime = r.EndTime
        }
    }
    if r.Tags != nil {
        todo.Tags = r.Tags
    }
} 