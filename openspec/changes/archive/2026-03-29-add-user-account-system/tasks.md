# Tasks: add-user-account-system

## Backend

- [x] 添加 SQLite 数据库支持（better-sqlite3）及初始化脚本
- [x] 创建 users 表（id, username, password_hash, avatar, progress, wrong_records, created_at, updated_at）
- [x] 实现用户注册 API（POST /api/auth/register），含密码强度校验（大写 + 特殊符号）
- [x] 实现用户登录 API（POST /api/auth/login），含错误次数计数与 CAPTCHA 触发逻辑
- [x] 实现 CAPTCHA 生成与验证 API（GET /api/auth/captcha, POST /api/auth/captcha/verify）
- [x] 实现 JWT Token 签发（有效期 3 天）与无感刷新中间件
- [x] 实现 Token 刷新 API（POST /api/auth/refresh）
- [x] 实现用户进度查询 API（GET /api/user/progress）
- [x] 实现用户进度更新 API（PUT /api/user/progress）
- [x] 实现 localStorage 进度迁移 API（POST /api/user/progress/migrate）
- [x] 添加全局认证中间件（保护需要登录的路由）

## Frontend

- [x] 新增登录页面组件
- [x] 新增注册页面组件
- [x] 新增 CAPTCHA 输入组件
- [x] 创建 AuthContext 管理登录状态与 Token
- [x] 实现 API 请求层（axios instance + Token 拦截器 + 无感刷新）
- [x] 实现首次登录时 localStorage 进度迁移到服务端
- [x] 将进度读写从 localStorage 切换到 API 调用
- [x] 添加头像选择组件（emoji 表情面板）
- [x] 在导航栏/侧边栏展示用户信息与退出入口
- [x] 未登录时重定向到登录页

## Infra

- [x] 后端 Dockerfile 添加 better-sqlite3 构建依赖
- [x] docker-compose.yml 配置数据卷持久化 SQLite 数据库文件
