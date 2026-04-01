# Linux 命令行学习平台

## 项目概述
一个交互式的 Linux 命令行学习平台，通过关卡式学习帮助用户掌握基础 Linux 命令。

## 技术栈
- Frontend: React + TypeScript + Tailwind CSS
- Terminal: @xterm/xterm
- Backend: Node.js + Socket.io
- Container: Docker (用于隔离的终端环境)

## 核心功能
- 关卡式学习进度
- 实时终端交互
- 进度保存

## 模块边界

### 关卡系统（三层分离）

新增关卡时涉及三个文件，职责严格分离：

| 层 | 文件 | 职责 | 约束 |
|---|------|------|------|
| 调用层 | `backend/src/socket/handlers.ts` | 调用 validator 并转发结果 | **禁止**直接调用 containerManager 做验证 |
| 验证层 | `backend/src/levels/validator.ts` | 所有验证逻辑封装在此，返回 `{ completed, output }` | **禁止**定义容器初始化命令 |
| 容器层 | `backend/src/docker/containerManager.ts` | 容器生命周期、命令执行、环境初始化 | **禁止**关心验证规则 |

**规则**：
- 调用层只能调验证层，不能跨层访问容器层做验证
- 验证补偿逻辑（如 adduser 用户已存在自动通过）必须封装在 validator 内部
- 新增验证类型只需改 validator.ts，不扩散到其他文件

### 前端 401 处理

- `frontend/src/services/api.ts` 的 401 拦截器使用 `skipAuthRedirect` 请求级配置
- 需要**自行处理 401** 的接口在调用时声明 `{ skipAuthRedirect: true }`，不维护 URL 白名单
