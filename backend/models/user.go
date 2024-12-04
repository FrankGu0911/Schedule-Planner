package models

import (
    "time"
    "golang.org/x/crypto/bcrypt"
)

const (
    RoleAdmin = "admin"
    RoleUser  = "user"

    StatusInactive = "inactive"
    StatusActive   = "active"
    StatusBlocked  = "blocked"
)

type User struct {
    ID        uint      `json:"id" gorm:"primarykey"`
    Username  string    `json:"username" gorm:"unique;not null"`
    Password  string    `json:"-" gorm:"not null"`  // json:"-" 确保密码不会在JSON响应中返回
    Role      string    `json:"role" gorm:"type:varchar(10);default:'user'"`
    Status    string    `json:"status" gorm:"type:varchar(10);default:'inactive'"`
    Todos     []Todo    `json:"todos"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

type UserRegister struct {
    Username string `json:"username" binding:"required,min=3,max=30"`
    Password string `json:"password" binding:"required,min=6"`
}

type UserLogin struct {
    Username string `json:"username" binding:"required"`
    Password string `json:"password" binding:"required"`
}

type UpdateUserRole struct {
    Role string `json:"role" binding:"required,oneof=admin user"`
}

type UpdatePassword struct {
    OldPassword string `json:"old_password" binding:"required"`
    NewPassword string `json:"new_password" binding:"required,min=6"`
}

type AdminUpdateUserPassword struct {
    Password string `json:"password" binding:"required,min=6"`
}

func (u *User) HashPassword() error {
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
    if err != nil {
        return err
    }
    u.Password = string(hashedPassword)
    return nil
}

func (u *User) CheckPassword(password string) error {
    return bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
}

func (u *User) IsAdmin() bool {
    return u.Role == RoleAdmin
}

func (u *User) IsActive() bool {
    return u.Status == StatusActive
} 