# TODOLIST

一个使用现代技术栈构建的待办事项应用。

## 项目结构
```
.
├── frontend/    # 前端项目目录（默认端口：5173）
│   └── ...      # 前端源代码文件
└── backend/     # 后端项目目录（默认端口：8080）
    └── ...      # 后端源代码文件
```

## 技术栈

### 前端
- 开发框架：Vue3

### 后端
- 开发语言：Go
- 主要框架：Gin

## 开发指南

### 前端开发
```bash
# 进入前端项目目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 后端开发
```bash
# 进入后端项目目录
cd backend

# 启动后端服务器
go run main.go
```

## 注意事项
- 确保已安装 Node.js 和 npm
- 确保已安装 Go 开发环境（建议 Go 1.16+）
- 前端和后端需要分别启动
- 前端默认运行在 http://localhost:5173
- 后端默认运行在 http://localhost:8080
