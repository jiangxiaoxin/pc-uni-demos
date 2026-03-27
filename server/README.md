# @pc-uni-h5/server

Express + MySQL 后台服务项目

## 功能特性

- 🚀 Express 4.x + TypeScript
- 🗄️ MySQL2 连接池
- 📦 统一 API 响应格式
- 🔒 Helmet 安全头
- 🌐 CORS 跨域支持
- 📝 Morgan 日志记录
- ✅ express-validator 参数验证
- 🔍 全局错误处理

## 目录结构

```
server/
├── src/
│   ├── app.ts              # 应用入口
│   ├── config/             # 配置文件
│   │   └── index.ts
│   ├── controllers/        # 控制器
│   │   └── user.controller.ts
│   ├── db/                 # 数据库连接
│   │   └── index.ts
│   ├── middleware/         # 中间件
│   │   └── errorHandler.ts
│   ├── models/             # 数据模型
│   │   └── user.model.ts
│   ├── routes/             # 路由
│   │   ├── index.ts
│   │   └── user.routes.ts
│   └── utils/              # 工具函数
│       └── response.ts
├── database.sql            # 数据库初始化脚本
├── package.json
├── tsconfig.json
└── .env.example            # 环境变量示例
```

## 快速开始

### 1. 安装依赖

```bash
cd server
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接信息
```

### 3. 初始化数据库

```bash
# 使用 MySQL 客户端执行初始化脚本
mysql -u root -p < database.sql
```

### 4. 启动开发服务器

```bash
# 开发模式（热重载）
pnpm run dev

# 或从根目录启动
pnpm --filter @pc-uni-h5/server run dev
```

### 5. 测试 API

```bash
# 健康检查
curl http://localhost:3001/api/health

# 获取用户列表
curl http://localhost:3001/api/users

# 创建用户
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "123456",
    "phone": "13800138000"
  }'
```

## API 文档

### 用户管理

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/users` | 获取用户列表（支持分页） |
| GET | `/api/users/:id` | 获取单个用户 |
| POST | `/api/users` | 创建用户 |
| PUT | `/api/users/:id` | 更新用户 |
| DELETE | `/api/users/:id` | 删除用户 |
| PATCH | `/api/users/:id/status` | 更新用户状态 |

### 查询参数

**分页参数**
- `page`: 页码，默认 1
- `pageSize`: 每页数量，默认 10

### 响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... },
  "timestamp": 1711523456789
}
```

## 生产部署

```bash
# 构建
pnpm run build

# 启动生产服务器
pnpm start
```

## 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务器端口 | 3001 |
| NODE_ENV | 运行环境 | development |
| DB_HOST | 数据库主机 | localhost |
| DB_PORT | 数据库端口 | 3306 |
| DB_USER | 数据库用户名 | root |
| DB_PASSWORD | 数据库密码 | - |
| DB_NAME | 数据库名称 | pc_uni_h5_db |
| CORS_ORIGIN | CORS 允许来源 | * |
