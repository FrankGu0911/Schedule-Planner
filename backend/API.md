# Schedule-Planner API 文档

## 通用说明

### 基础URL
```
http://localhost:8080/api/v1
```

### 响应格式
所有API响应均为JSON格式，包含以下基础结构：

```json
{
    "error": "错误信息",    // 仅在发生错误时出现
    "data": {},           // 响应数据
    "message": ""         // 响应消息
}
```

### 认证方式
需要认证的接口都需要在请求头中携带 Token：
```
Authorization: Bearer {token}
```

### 用户角色
- `admin`: 管理员
- `user`: 普通用户

### 用户状态
- `inactive`: 未激活（待管理员确认）
- `active`: 已激活
- `blocked`: 已禁用

## 接口详情

### 1. 用户认证

#### 1.1 用户注册
- 方法: `POST`
- 路径: `/auth/register`
- Content-Type: `application/json`

请求参数：
```json
{
    "username": "string",
    "password": "string"
}
```

成功响应 (200):
```json
{
    "message": "注册成功，请等待管理员审核",
    "user": {
        "id": 1,
        "username": "example",
        "role": "user",
        "status": "inactive"
    }
}
```

错误响应 (400):
```json
{
    "error": "用户名已存在"
}
```

#### 1.2 用户登录
- 方法: `POST`
- 路径: `/auth/login`
- Content-Type: `application/json`

请求参数：
```json
{
    "username": "string",
    "password": "string"
}
```

成功响应 (200):
```json
{
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": 1,
        "username": "example",
        "role": "user",
        "status": "active"
    }
}
```

错误响应 (401):
```json
{
    "error": "用户名或密码错误"
}
```

错误响应 (403):
```json
{
    "error": "账号未激活，请等待管理员审核"
}
```

#### 1.3 修改密码
- 方法: `PUT`
- 路径: `/auth/password`
- 认证: 需要
- Content-Type: `application/json`

请求参数：
```json
{
    "old_password": "string",
    "new_password": "string"
}
```

成功响应 (200):
```json
{
    "message": "密码修改成功"
}
```

错误响应 (400):
```json
{
    "error": "旧密码错误"
}
```

错误响应 (400):
```json
{
    "error": "新密码长度必须大于6位"
}
```

### 2. 用户管理（仅管理员）

#### 2.1 获取用户列表
- 方法: `GET`
- 路径: `/admin/users`
- 认证: 需要（仅管理员）

查询参数：
- `status`: 用户状态筛选（可选，inactive/active/blocked）
- `role`: 用户角色筛选（可选，admin/user）

成功响应 (200):
```json
{
    "total": 100,
    "users": [
        {
            "id": 1,
            "username": "example",
            "role": "user",
            "status": "active",
            "created_at": "2024-01-01T00:00:00Z"
        }
    ]
}
```

#### 2.2 激活用户
- 方法: `POST`
- 路径: `/admin/users/:id/activate`
- 认证: 需要（仅管理员）

成功响应 (200):
```json
{
    "message": "用户已激活",
    "user": {
        "id": 1,
        "username": "example",
        "role": "user",
        "status": "active"
    }
}
```

#### 2.3 禁用用户
- 方法: `POST`
- 路径: `/admin/users/:id/block`
- 认证: 需要（仅管理员）

成功响应 (200):
```json
{
    "message": "用户已禁用",
    "user": {
        "id": 1,
        "username": "example",
        "role": "user",
        "status": "blocked"
    }
}
```

#### 2.4 修改用户角色
- 方法: `PUT`
- 路径: `/admin/users/:id/role`
- 认证: 需要（仅管理员）
- Content-Type: `application/json`

请求参数：
```json
{
    "role": "admin"  // "admin" 或 "user"
}
```

成功响应 (200):
```json
{
    "message": "用户角色已更新",
    "user": {
        "id": 1,
        "username": "example",
        "role": "admin",
        "status": "active"
    }
}
```

#### 2.5 修改用户密码
- 方法: `PUT`
- 路径: `/admin/users/:id/password`
- 认证: 需要（仅管理员）
- Content-Type: `application/json`

请求参数：
```json
{
    "password": "string"  // 新密码，至少6位
}
```

成功响应 (200):
```json
{
    "message": "密码修改成功",
    "user": {
        "id": 1,
        "username": "example",
        "role": "user",
        "status": "active"
    }
}
```

错误响应 (400):
```json
{
    "error": "新密码长度必须大于6位"
}
```

错误响应 (403):
```json
{
    "error": "无权限访问"
}
```

错误响应 (404):
```json
{
    "error": "用户不存在"
}
```

#### 2.6 删除用户
- 方法: `DELETE`
- 路径: `/admin/users/:id`
- 认证: 需要（仅管理员）

成功响应 (200):
```json
{
    "message": "用户删除成功",
    "user": {
        "id": 1,
        "username": "example",
        "role": "user",
        "status": "active"
    }
}
```

错误响应 (403):
```json
{
    "error": "不能删除自己的账号"
}
```

错误响应 (404):
```json
{
    "error": "用户不存在"
}
```

### 3. 待办事项管理

#### 3.1 创建待办事项
- 方法: `POST`
- 路径: `/todos`
- 认证: 需要
- Content-Type: `application/json`

请求参数：
```json
{
    "title": "string",              // 必填
    "description": "string",        // 可选
    "is_long_term": false,         // 可选，默认为false
    "start_time": "2024-01-01 08:00:00",  // 可选，默认为当前时间
    "end_time": "2024-01-02 18:00:00",    // 可选，默认为开始时间后24小时
    "tags": ["工作", "学习"]       // 可选
}
```

成功响应 (201):
```json
{
    "id": 1,
    "title": "完成项目",
    "description": "完成API文档编写",
    "completed": false,
    "is_long_term": false,
    "user_id": 1,
    "start_time": "2024-01-01 08:00:00",
    "end_time": "2024-01-02 18:00:00",
    "tags": ["工作", "学习"],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
}
```

错误响应 (400):
```json
{
    "error": "创建待办事项失败"
}
```

#### 3.2 获取待办事项列表
- 方法: `GET`
- 路径: `/todos`
- 认证: 需要

查询参数：
- `tag`: 标签筛选（可选）
- `start_time`: 开始时间筛选（可选，格式：YYYY-MM-DD HH:mm:ss）
- `end_time`: 结束时间筛选（可选，格式：YYYY-MM-DD HH:mm:ss）
- `is_long_term`: 是否为长期任务（可选，true/false）

成功响应 (200):
```json
[
    {
        "id": 1,
        "title": "完成项目",
        "description": "完成API文档编写",
        "completed": false,
        "is_long_term": true,
        "user_id": 1,
        "start_time": "2024-01-01 08:00:00",
        "end_time": "2024-01-02 18:00:00",
        "tags": ["工作", "学习"],
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    }
]
```

#### 3.3 获取单个待办事项
- 方法: `GET`
- 路径: `/todos/:id`
- 认证: 需要

成功响应 (200):
```json
{
    "id": 1,
    "title": "完成项目",
    "description": "完成API文档编写",
    "user_id": 1,
    "start_time": "2024-01-01T00:00:00Z",
    "end_time": "2024-01-02T00:00:00Z",
    "tags": ["工作", "学习"],
    "completed": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
}
```

错误响应 (404):
```json
{
    "error": "待办事项不存在"
}
```

#### 3.4 更新待办事项
- 方法: `PUT`
- 路径: `/todos/:id`
- 认证: 需要
- Content-Type: `application/json`

请求参数：
```json
{
    "title": "string",
    "description": "string",
    "completed": true,
    "is_long_term": true,
    "start_time": "2024-01-01 08:00:00",
    "end_time": "2024-01-02 18:00:00",
    "tags": ["工作", "学习"]
}
```

成功响应 (200):
```json
{
    "id": 1,
    "title": "完成项目",
    "description": "完成API文档编写",
    "completed": true,
    "is_long_term": true,
    "user_id": 1,
    "start_time": "2024-01-01 08:00:00",
    "end_time": "2024-01-02 18:00:00",
    "tags": ["工作", "学习"],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
}
```

错误响应 (404):
```json
{
    "error": "待办事项不存在"
}
```

#### 3.5 删除待办事项
- 方法: `DELETE`
- 路径: `/todos/:id`
- 认证: 需要

成功响应 (200):
```json
{
    "message": "删除成功"
}
```

错误响应 (404):
```json
{
    "error": "待办事项不存在"
}
```

## 注意事项
1. 所有需要认证的接口必须在请求头中携带有效的 Token
2. 待办事项的时间格式统一使用 "YYYY-MM-DD HH:mm:ss"，例如："2024-01-01 08:00:00"
3. 系统时间（如created_at, updated_at）使用 ISO 8601 标准格式
4. 所有请求和响应的 Content-Type 均为 application/json
5. 错误响应会包含具体的错误信息在 error 字段中
6. 管理员接口仅限于 role 为 "admin" 的用户访问
7. 新注册用户默认状态为 "inactive"，需要管理员激活后才能使用系统
8. 待办事项的默认值处理：
   - 开始时间为空时，默认为当前时间
   - 结束时间为空时，默认为开始时间后24小时
   - 是否为长期任务为空时，默认为false
9. 默认管理员账号：
   - 用户名：admin
   - 密码：123456