# TODOList API 文档

## 基础信息
- 基础路径: `/api/v1`
- 响应格式: JSON

## 用户相关接口

### 1. 用户注册
- 路径: `/user/register`
- 方法: POST
- 请求体:
```json
{
    "username": "string",
    "password": "string",
    "email": "string"
}
```
- 响应:
```json
{
    "code": 200,
    "message": "注册成功",
    "data": {
        "user_id": "integer",
        "username": "string"
    }
}
```

### 2. 用户登录
- 路径: `/user/login`
- 方法: POST
- 请求体:
```json
{
    "username": "string",
    "password": "string"
}
```
- 响应:
```json
{
    "code": 200,
    "message": "登录成功",
    "data": {
        "token": "string"
    }
}
```

## TODO项目相关接口

### 1. 创建待办事项
- 路径: `/todos`
- 方法: POST
- 请求头: `Authorization: Bearer {token}`
- 请求体:
```json
{
    "title": "string",
    "description": "string",
    "due_date": "string",
    "priority": "integer",
    "start_time": "datetime",
    "end_time": "datetime",
    "tags": ["string"]
}
```
- 响应:
```json
{
    "code": 200,
    "message": "创建成功",
    "data": {
        "id": "integer",
        "title": "string",
        "created_at": "string",
        "start_time": "datetime",
        "end_time": "datetime",
        "tags": ["string"]
    }
}
```

### 2. 获取待办事项列表
- 路径: `/todos`
- 方法: GET
- 请求头: `Authorization: Bearer {token}`
- 查询参数:
  - `page`: 页码
  - `page_size`: 每页数量
  - `status`: 状态筛选
  - `tag`: 标签筛选（可选）
  - `start_time`: 开始时间筛选（可选）
  - `end_time`: 结束时间筛选（可选）
- 响应:
```json
{
    "code": 200,
    "data": {
        "total": "integer",
        "items": [
            {
                "id": "integer",
                "title": "string",
                "description": "string",
                "status": "integer",
                "due_date": "string",
                "created_at": "string",
                "start_time": "datetime",
                "end_time": "datetime",
                "tags": ["string"]
            }
        ]
    }
}
```

### 3. 更新待办事项
- 路径: `/todos/:id`
- 方法: PUT
- 请求头: `Authorization: Bearer {token}`
- 请求体:
```json
{
    "title": "string",
    "description": "string",
    "status": "integer",
    "due_date": "string",
    "priority": "integer",
    "start_time": "datetime",
    "end_time": "datetime",
    "tags": ["string"]
}
```
- 响应:
```json
{
    "code": 200,
    "message": "更新成功"
}
```

### 4. 删除待办事项
- 路径: `/todos/:id`
- 方法: DELETE
- 请求头: `Authorization: Bearer {token}`
- 响应:
```json
{
    "code": 200,
    "message": "删除成功"
}
```

## 错误响应
所有接口的错误响应格式如下：
```json
{
    "code": "integer",
    "message": "string",
    "error": "string"
}
```

常见错误码：
- 400: 请求参数错误
- 401: 未授权
- 403: 禁止访问
- 404: 资源不存在
- 500: 服务器内部错误