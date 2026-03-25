# Tasks: Add Day 4 部署上线

## Phase 1: Docker 环境准备

### Task 1.1: 更新 Dockerfile
- [x] 安装 nginx 包
- [x] 创建必要的目录结构 (/run/nginx, /var/www/html, /var/log/nginx)
- [x] 预置一个简单的 Vue 示例项目
- [x] 配置目录权限

### Task 1.2: 创建 Vue 示例项目
- [x] 创建 `/home/player/my-app` 目录
- [x] 添加 package.json (简化版，模拟已安装依赖)
- [x] 添加 vite.config.js 和基本源码结构

## Phase 2: 后端验证器扩展

### Task 2.1: Nginx 配置验证
- [x] 添加 `nginx_running` 验证类型
- [x] 更新 LEVEL_VALIDATIONS 添加 Level 21-30

### Task 2.2: 更新 Level Setup Commands
- [x] Level 21-23: 预置 Vue 项目和 dist 目录
- [x] Level 27-29: 预置 Nginx 环境
- [x] Level 30: 启动 mock API 服务

## Phase 3: 前端关卡配置

### Task 3.1: 添加 Chapter 4 配置
- [x] 更新 Progress 组件的 chapterConfig
- [x] 添加图标和颜色配置

### Task 3.2: 添加 10 个关卡数据
- [x] Level 21: 构建打包
- [x] Level 22: 构建产物
- [x] Level 23: 部署文件
- [x] Level 24: 了解配置
- [x] Level 25: 配置虚拟主机
- [x] Level 26: 检查配置
- [x] Level 27: 启动服务
- [x] Level 28: 测试访问
- [x] Level 29: 查看日志
- [x] Level 30: 终极挑战（反向代理）

## Phase 4: 测试与文档

### Task 4.1: 集成测试
- [x] Docker 镜像构建成功
- [x] npm run build 功能验证
- [x] Nginx 启动和访问验证
- [x] Mock API 功能验证
- [ ] 端到端测试（需手动在平台中验证）

### Task 4.2: 更新 README
- [ ] 添加第四章的描述
- [ ] 更新关卡总数说明

---

## 实现完成总结

### 已完成的文件修改

1. **docker/Dockerfile.level**
   - 添加 nginx、nodejs、npm 安装
   - 创建 Nginx 目录和默认配置
   - 创建 Vue 示例项目 `/home/player/my-app`
   - 创建 mock-api 服务脚本

2. **backend/src/levels/validator.ts**
   - 添加 `nginx_running` 验证类型
   - 添加 Level 21-30 的验证规则

3. **backend/src/docker/containerManager.ts**
   - 添加 Level 21-30 的 setup commands

4. **frontend/src/App.tsx**
   - 添加 Chapter 4 的 10 个关卡配置

5. **frontend/src/components/Progress/Progress.tsx**
   - 添加 Chapter 4 的显示配置

### 验证结果

- ✅ Docker 镜像构建成功
- ✅ npm run build 创建 dist 目录
- ✅ Nginx 启动并返回静态文件
- ✅ Mock API 返回 JSON 响应
