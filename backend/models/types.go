package models

import (
    "time"
    "database/sql/driver"
    "encoding/json"
    "fmt"
    "strconv"
)

const (
    TimeFormat = "2006-01-02 15:04:05"
)

// CustomTime 自定义时间类型
type CustomTime struct {
    time.Time
}

// MarshalJSON 自定义时间格式的JSON序列化
func (t CustomTime) MarshalJSON() ([]byte, error) {
    if t.Time.IsZero() {
        return []byte("null"), nil
    }
    formatted := t.Time.UTC().Format(TimeFormat)
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
    if str == "" {
        t.Time = time.Time{}
        return nil
    }
    parsed, err := time.Parse(TimeFormat, str)
    if err != nil {
        return err
    }
    t.Time = parsed.UTC()
    return nil
}

// Value 实现 driver.Valuer 接口
func (t CustomTime) Value() (driver.Value, error) {
    if t.Time.IsZero() {
        return nil, nil
    }
    return t.Time, nil
}

// Scan 实现 sql.Scanner 接口
func (t *CustomTime) Scan(value interface{}) error {
    if value == nil {
        t.Time = time.Time{}
        return nil
    }
    if v, ok := value.(time.Time); ok {
        t.Time = v
        return nil
    }
    return nil
}

// StringSlice 用于处理字符串数组的数据库序列化
type StringSlice []string

// Value 实现 driver.Valuer 接口
func (s StringSlice) Value() (driver.Value, error) {
    if len(s) == 0 {
        return "[]", nil
    }
    bytes, err := json.Marshal(s)
    if err != nil {
        return nil, err
    }
    return string(bytes), nil
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

// CustomBool 自定义布尔类型，支持数字和布尔值的转换
type CustomBool bool

// UnmarshalJSON 自定义布尔值的JSON反序列化
func (b *CustomBool) UnmarshalJSON(data []byte) error {
    str := string(data)
    if str == "null" {
        *b = false
        return nil
    }
    if str == "1" || str == "true" {
        *b = true
        return nil
    }
    if str == "0" || str == "false" {
        *b = false
        return nil
    }
    // 尝试解析数字
    if num, err := strconv.ParseInt(str, 10, 64); err == nil {
        *b = num != 0
        return nil
    }
    return fmt.Errorf("invalid boolean value: %s", str)
}

// MarshalJSON 自定义布尔值的JSON序列化
func (b CustomBool) MarshalJSON() ([]byte, error) {
    if b {
        return []byte("true"), nil
    }
    return []byte("false"), nil
} 