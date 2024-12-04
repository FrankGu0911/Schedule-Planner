package models

import (
    "database/sql/driver"
    "encoding/json"
    "fmt"
    "time"
)

const (
    TimeFormat = "2006-01-02 15:04:05"
)

type CustomTime struct {
    time.Time
}

// MarshalJSON 自定义时间格式的JSON序列化（返回本地时间）
func (t CustomTime) MarshalJSON() ([]byte, error) {
    if t.Time.IsZero() {
        return []byte("null"), nil
    }
    // 转换为本地时间后格式化
    formatted := t.Time.Local().Format(TimeFormat)
    return []byte(`"` + formatted + `"`), nil
}

// UnmarshalJSON 自定义时间格式的JSON反序列化（输入为本地时间）
func (t *CustomTime) UnmarshalJSON(data []byte) error {
    if string(data) == "null" {
        t.Time = time.Time{}
        return nil
    }
    // 去掉引号
    str := string(data)[1 : len(data)-1]
    // 解析为本地时间
    parsed, err := time.ParseInLocation(TimeFormat, str, time.Local)
    if err != nil {
        return err
    }
    // 转换为 UTC 时间存储
    t.Time = parsed.UTC()
    return nil
}

// Value 实现 driver.Valuer 接口，用于数据库存储（存储 UTC 时间）
func (t CustomTime) Value() (driver.Value, error) {
    if t.Time.IsZero() {
        return nil, nil
    }
    // 确保存储 UTC 时间
    return t.Time.UTC(), nil
}

// Scan 实现 sql.Scanner 接口，用于数据库读取
func (t *CustomTime) Scan(value interface{}) error {
    if value == nil {
        t.Time = time.Time{}
        return nil
    }

    switch v := value.(type) {
    case time.Time:
        t.Time = v
    case string:
        parsed, err := time.Parse(TimeFormat, v)
        if err != nil {
            return err
        }
        t.Time = parsed
    case []byte:
        parsed, err := time.Parse(TimeFormat, string(v))
        if err != nil {
            return err
        }
        t.Time = parsed
    default:
        return fmt.Errorf("cannot scan type %T into CustomTime", value)
    }
    
    return nil
}

// StringSlice 用于处理字符串数组的 JSON 序列化和反序列化
type StringSlice []string

// Value 实现 driver.Valuer 接口
func (s StringSlice) Value() (driver.Value, error) {
    if len(s) == 0 {
        return "[]", nil
    }
    return json.Marshal(s)
}

// Scan 实现 sql.Scanner 接口
func (s *StringSlice) Scan(value interface{}) error {
    if value == nil {
        *s = StringSlice{}
        return nil
    }

    var bytes []byte
    switch v := value.(type) {
    case string:
        bytes = []byte(v)
    case []byte:
        bytes = v
    default:
        return fmt.Errorf("failed to scan StringSlice value: %v", value)
    }

    return json.Unmarshal(bytes, s)
}

type Todo struct {
    ID          uint        `json:"id" gorm:"primarykey"`
    Title       string      `json:"title" binding:"required" gorm:"not null"`
    Description string      `json:"description"`
    Completed   bool        `json:"completed" gorm:"default:false"`
    IsLongTerm  uint8       `json:"is_long_term" gorm:"type:tinyint;default:0"`
    UserID      uint        `json:"user_id" gorm:"not null"`
    StartTime   CustomTime  `json:"start_time" gorm:"type:datetime;default:CURRENT_TIMESTAMP"`
    EndTime     CustomTime  `json:"end_time" gorm:"type:datetime;default:CURRENT_TIMESTAMP"`
    Tags        StringSlice `json:"tags" gorm:"type:text"`
    CreatedAt   time.Time   `json:"created_at" gorm:"type:datetime;default:CURRENT_TIMESTAMP"`
    UpdatedAt   time.Time   `json:"updated_at" gorm:"type:datetime;default:CURRENT_TIMESTAMP"`
}

// BeforeCreate 在创建记录前设置默认值
func (t *Todo) BeforeCreate() error {
    // 如果开始时间为空，设置为当前 UTC 时间
    if t.StartTime.IsZero() {
        t.StartTime = CustomTime{time.Now().UTC()}
    }
    
    // 如果结束时间为空，设置为开始时间后24小时
    if t.EndTime.IsZero() {
        t.EndTime = CustomTime{t.StartTime.Add(24 * time.Hour)}
    }
    
    return nil
}

type CreateTodoRequest struct {
    Title       string      `json:"title" binding:"required"`
    Description string      `json:"description"`
    IsLongTerm  *uint8      `json:"is_long_term,omitempty"` // 使用指针类型，可以判断是否提供了该字段
    StartTime   *CustomTime `json:"start_time,omitempty"`   // 使用指针类型，可以判断是否提供了该字段
    EndTime     *CustomTime `json:"end_time,omitempty"`     // 使用指针类型，可以判断是否提供了该字段
    Tags        []string    `json:"tags"`
}

// ToTodo 将请求转换为Todo模型，并设置默认值
func (r *CreateTodoRequest) ToTodo(userID uint) *Todo {
    todo := &Todo{
        Title:       r.Title,
        Description: r.Description,
        UserID:      userID,
        Tags:        r.Tags,
        IsLongTerm:  0, // 默认为0
    }

    // 设置是否为长期任务
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
    IsLongTerm  *uint8      `json:"is_long_term,omitempty"`
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