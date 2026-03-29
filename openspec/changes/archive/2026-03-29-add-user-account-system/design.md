# Design: add-user-account-system

## 架构概览

```
┌─────────────┐     HTTP/REST      ┌─────────────┐     better-sqlite3     ┌──────────┐
│   Frontend  │ ◄────────────────► │   Backend   │ ◄────────────────────► │  SQLite  │
│  React SPA  │   JWT Bearer       │  Express    │                        │  data.db │
└─────────────┘                    └─────────────┘                        └──────────┘
```

## 技术选型

| 决策项           | 选择                     | 理由                                               |
| ---------------- | ------------------------ | -------------------------------------------------- |
| 数据库           | SQLite (better-sqlite3)  | 单文件、零配置、单用户场景足够，无需额外服务         |
| 密码哈希         | bcrypt (bcryptjs)        | 业界标准，自带 salt                                 |
| Token 方案       | JWT (jsonwebtoken)       | 无状态、易扩展                                       |
| CAPTCHA          | svg-captcha              | 纯后端生成 SVG 图片，无外部服务依赖                  |
| Emoji 头像       | Unicode emoji 列表       | 无需下载素材，前端内置 emoji 列表，用户名存数据库     |

## 数据模型

### users 表

```sql
CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  avatar        TEXT    NOT NULL DEFAULT '😀',
  login_fail_count INTEGER NOT NULL DEFAULT 0,
  locked_until  INTEGER,          -- Unix timestamp, NULL 表示未锁定
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);
```

### user_progress 表

```sql
CREATE TABLE user_progress (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_level   INTEGER NOT NULL DEFAULT 1,
  completed_levels TEXT  NOT NULL DEFAULT '[]',  -- JSON array: [1, 2, 5, ...]
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(user_id)
);
```

### wrong_records 表（预留占位）

```sql
CREATE TABLE wrong_records (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level_id      INTEGER NOT NULL,
  detail        TEXT,              -- JSON, 预留字段，后续定义结构
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);
```

## 认证流程

### 注册

1. 前端提交 `{ username, password }`
2. 后端校验：
   - 用户名 2-20 字符，支持中文、英文、数字、下划线
   - 密码 8-64 字符，必须包含至少一个大写字母和一个特殊符号
3. bcrypt hash 密码 → 存入 users 表
4. 签发 JWT，返回 `{ token, user }`

### 登录

1. 前端提交 `{ username, password, captchaId?, captchaCode? }`
2. 检查 `login_fail_count`：
   - `< 5`：正常验证
   - `≥ 5`：要求提供 captchaId + captchaCode，验证 CAPTCHA
3. 验证密码：
   - 成功：重置 `login_fail_count = 0`，签发 JWT
   - 失败：`login_fail_count += 1`，返回剩余次数
4. 返回 `{ token, user }` 或 `{ error, failCount }`

### Token 管理

```
┌────────┐  请求带 Bearer Token  ┌────────┐
│ Client │ ────────────────────► │ Server │
│        │ ◄──────────────────── │        │
└────────┘  响应 + 新 Token      └────────┘
            (当剩余有效期 < 1 天时)
```

- Token 有效期：3 天
- **无感刷新策略**：认证中间件检查 Token 剩余有效期，若 < 1 天且请求成功，在响应头 `X-New-Token` 中返回新 Token
- 前端 axios 拦截器自动读取 `X-New-Token` 并替换本地存储的 Token
- 专门的 `POST /api/auth/refresh` 端点用于主动刷新

### CAPTCHA

1. `GET /api/auth/captcha` → 返回 `{ captchaId, svg }` (SVG 图片)
2. 前端展示 SVG，用户输入验证码
3. 登录时一并提交 `captchaId` + `captchaCode`
4. 验证码一次有效，验证后销毁（存入内存 Map，5 分钟过期）

## API 端点

| 方法   | 路径                          | 认证 | 说明                    |
| ------ | ----------------------------- | ---- | ----------------------- |
| POST   | /api/auth/register            | 否   | 用户注册                |
| POST   | /api/auth/login               | 否   | 用户登录                |
| POST   | /api/auth/refresh             | 是   | 刷新 Token              |
| GET    | /api/auth/captcha             | 否   | 获取 CAPTCHA 图片       |
| GET    | /api/user/profile             | 是   | 获取用户信息            |
| PUT    | /api/user/avatar              | 是   | 更新头像                |
| GET    | /api/user/progress            | 是   | 获取学习进度            |
| PUT    | /api/user/progress            | 是   | 更新学习进度            |
| POST   | /api/user/progress/migrate    | 是   | 迁移 localStorage 进度  |

## Emoji 头像方案

前端内置一个 emoji 列表常量（如 60-80 个常用表情），用户注册时随机分配一个默认头像。用户可在个人设置中从 emoji 面板选择更换。头像字段存储 emoji Unicode 字符串（如 `"🦊"`），无需下载任何图片素材。

## 进度迁移

用户首次登录后，前端检测 localStorage 中已有进度，调用 `POST /api/user/progress/migrate` 将完成的关卡列表发送到服务端。服务端取 localStorage 和服务端进度的并集保存，确保迁移不丢数据。

## 安全措施

- bcrypt 密码哈希（cost factor = 10）
- JWT 签名使用 HS256 + 服务端密钥
- 登录失败计数 + CAPTCHA 防暴力破解
- 密码强度校验（大写 + 特殊符号，最少 8 位）
- Token 黑名单（可选，使用内存 Map，Token 主动失效时添加）
