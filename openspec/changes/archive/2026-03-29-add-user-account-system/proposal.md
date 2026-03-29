# Proposal: add-user-account-system

## Why

当前平台使用 localStorage 保存用户学习进度，用户清除浏览器数据或更换设备后进度丢失。需要引入账号体系，实现跨设备进度持久化，并为后续学习数据分析能力预留扩展空间。

## What Changes

1. **新增用户认证体系**
   - 用户注册/登录，支持中文用户名作为登录名
   - 密码策略：强制包含大写字母和特殊符号
   - 连续输错密码 5 次触发图灵测试（CAPTCHA）

2. **Token 管理**
   - JWT Token 有效期 3 天
   - Token 有效期内持续使用时无感刷新（sliding expiration）

3. **用户数据模型**
   - 头像字段：默认使用 emoji 表情作为头像，与系统内置表情同步，素材不落本地
   - 学习进度：从 localStorage 迁移至服务端持久化
   - 扩展占位字段：为后续"错题记录"等功能预留

4. **前端改动**
   - 新增登录/注册页面
   - 接入 Token 管理与请求拦截
   - 进度读写切换到 API 调用

## Impact

- **Backend**: 新增数据库（SQLite）、用户模型、认证中间件、进度 API
- **Frontend**: 新增登录/注册页面、全局 auth 状态管理、API 请求层改造
- **Breaking**: localStorage 进度需一次性迁移到服务端（首次登录时）
