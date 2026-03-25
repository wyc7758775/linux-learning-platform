# Spec: Day 4 部署上线

## ADDED Requirements

### Requirement: Level 21 - 构建打包

系统 **SHALL** 提供关卡 21"构建打包"，用户进入项目目录并执行构建命令，理解前端构建流程。

#### Scenario: 执行构建命令
- **Given**: `/home/player/my-app` 目录存在，包含预置的 Vue 项目结构
- **When**: 用户执行 `cd /home/player/my-app && npm run build`
- **Then**: `dist/` 目录被创建，关卡完成

---

### Requirement: Level 22 - 构建产物

系统 **SHALL** 提供关卡 22"构建产物"，用户查看构建输出，理解打包后的文件结构。

#### Scenario: 查看构建产物
- **Given**: `dist/` 目录已存在
- **When**: 用户执行 `ls dist/` 或 `ls -lh dist/`
- **Then**: 输出包含 `index.html`，关卡完成

---

### Requirement: Level 23 - 部署文件

系统 **SHALL** 提供关卡 23"部署文件"，用户将构建产物复制到 Web 服务器根目录。

#### Scenario: 复制文件到 Web 目录
- **Given**: `/home/player/my-app/dist/` 目录包含构建产物
- **When**: 用户执行 `cp -r /home/player/my-app/dist/* /var/www/html/`
- **Then**: `/var/www/html/index.html` 存在，关卡完成

---

### Requirement: Level 24 - 了解配置

系统 **SHALL** 提供关卡 24"了解配置"，用户查看 Nginx 配置文件，理解其结构。

#### Scenario: 查看 Nginx 主配置
- **Given**: Nginx 已安装
- **When**: 用户执行 `cat /etc/nginx/nginx.conf`
- **Then**: 输出包含 `http` 配置块，关卡完成

---

### Requirement: Level 25 - 配置虚拟主机

系统 **SHALL** 提供关卡 25"配置虚拟主机"，用户为应用编写 Nginx server block 配置。

#### Scenario: 创建站点配置文件
- **Given**: `/etc/nginx/http.d/` 目录存在
- **When**: 用户创建 `/etc/nginx/http.d/myapp.conf` 文件，包含有效的 server 配置
- **Then**: 配置文件存在且包含 `server {` 内容，关卡完成

---

### Requirement: Level 26 - 检查配置

系统 **SHALL** 提供关卡 26"检查配置"，用户使用 nginx -t 验证配置语法。

#### Scenario: 验证配置语法
- **Given**: Nginx 配置文件已创建
- **When**: 用户执行 `sudo nginx -t`
- **Then**: 输出包含 `syntax is ok` 或 `test is successful`，关卡完成

---

### Requirement: Level 27 - 启动服务

系统 **SHALL** 提供关卡 27"启动服务"，用户启动 Nginx 服务并确认进程运行。

#### Scenario: 启动 Nginx
- **Given**: 配置语法检查通过
- **When**: 用户执行 `sudo nginx` 启动服务
- **Then**: `ps aux | grep nginx` 输出包含 `nginx: master`，关卡完成

---

### Requirement: Level 28 - 测试访问

系统 **SHALL** 提供关卡 28"测试访问"，用户用 curl 测试网站是否正常响应。

#### Scenario: 测试 HTTP 服务
- **Given**: Nginx 已启动，`/var/www/html/index.html` 存在
- **When**: 用户执行 `curl localhost` 或 `curl -s localhost`
- **Then**: 输出包含 `<html` 或 `<!DOCTYPE`，关卡完成

---

### Requirement: Level 29 - 查看日志

系统 **SHALL** 提供关卡 29"查看日志"，用户查看 Nginx 访问日志。

#### Scenario: 查看访问日志
- **Given**: Nginx 已启动且有访问记录
- **When**: 用户执行 `tail /var/log/nginx/access.log`
- **Then**: 输出包含 HTTP 方法（如 `GET`），关卡完成

---

### Requirement: Level 30 - 终极挑战：反向代理

系统 **SHALL** 提供关卡 30"终极挑战"，用户配置 Nginx 反向代理，将 API 请求转发到后端服务。

#### Scenario: 配置反向代理
- **Given**:
  - Nginx 已运行
  - 模拟后端服务运行在 localhost:3000，`/api/status` 返回 `{"status":"ok"}`
- **When**: 用户
  1. 在 myapp.conf 添加 `location /api/ { proxy_pass http://localhost:3000/; }`
  2. 执行 `sudo nginx -s reload`
  3. 执行 `curl localhost/api/status`
- **Then**: 输出包含 `ok`，关卡完成

---

## MODIFIED Requirements

### Requirement: 扩展前端关卡定义

系统 **MUST** 修改 `frontend/src/App.tsx` 中的 LEVELS 数组，添加 Level 21-30 的定义。

#### Scenario: 显示新关卡
- **Given**: 用户查看关卡列表
- **When**: 应用加载
- **Then**: 显示 Chapter 4: 部署上线的 10 个新关卡

---

### Requirement: 扩展后端验证规则

系统 **MUST** 修改 `backend/src/levels/validator.ts` 中的 LEVEL_VALIDATIONS，添加 Level 21-30 的验证逻辑。

#### Scenario: 验证新关卡
- **Given**: 用户在部署关卡中执行命令
- **When**: 命令执行完成
- **Then**: 根据关卡要求验证命令输出/文件/进程状态

---

### Requirement: 更新 Docker 镜像

系统 **MUST** 修改 `docker/Dockerfile.level`，添加 Nginx 和示例 Vue 项目。

#### Scenario: 构建学习环境镜像
- **Given**: Docker 构建过程
- **When**: 执行 `docker build`
- **Then**: 镜像包含 nginx、nodejs、预置的 Vue 项目
