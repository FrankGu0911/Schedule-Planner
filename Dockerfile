# 前端构建阶段
FROM node:18-alpine as frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# 后端构建阶段
FROM golang:1.20-alpine as backend-builder
WORKDIR /app/backend
COPY backend/ .
RUN go mod download
RUN go build -o main .

# 最终阶段
FROM nginx:alpine
WORKDIR /app

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 复制后端二进制文件
COPY --from=backend-builder /app/backend/main .
COPY --from=backend-builder /app/backend/todo.db ./todo.db

# 复制前端构建文件到 Nginx 默认目录
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# 安装必要的运行时依赖
RUN apk add --no-cache ca-certificates

# 创建启动脚本
RUN echo "#!/bin/sh\n./main & nginx -g 'daemon off;'" > /app/start.sh && chmod +x /app/start.sh

EXPOSE 80

# 启动服务
CMD ["/app/start.sh"] 