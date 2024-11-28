package models

import (
    "time"
    "golang.org/x/crypto/bcrypt"
)

type User struct {
    ID        uint      `json:"id" gorm:"primarykey"`
    Username  string    `json:"username" gorm:"unique;not null"`
    Password  string    `json:"-" gorm:"not null"`  // json:"-" 确保密码不会在JSON响应中返回
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