# Linux Learning Platform - Docker 部署指南

## 绿联 NAS 部署（推荐）

### 前置要求
- 绿联 NAS 开启 Docker 功能
- NAS 可以访问互联网（拉取镜像）

### 一键部署

1. **SSH 登录到 NAS**
```bash
ssh root@<NAS-IP>
```

2. **创建部署目录**
```bash
mkdir -p /volume1/docker/linux-learning
cd /volume1/docker/linux-learning
```

3. **下载 docker-compose 配置**
```bash
# 替换 wyc7758775 为你的 GitHub 用户名
wget https://raw.githubusercontent.com/wyc7758775/linux-learning-platform/main/docker-compose.nas.yml -O docker-compose.yml
```

4. **启动服务**
```bash
# 设置你的 GitHub 用户名
export GHCR_USER=wyc7758775

# 拉取镜像并启动
docker-compose pull && docker-compose up -d
```

5. **访问应用**

浏览器打开 `http://<NAS-IP>:8080`

---

## GitHub Actions 自动构建

当你 `git push` 到 `main` 分支时，GitHub Actions 会自动：

1. 构建 3 个 Docker 镜像：
   - `ghcr.io/<user>/linux-learning-frontend:latest`
   - `ghcr.io/<user>/linux-learning-backend:latest`
   - `ghcr.io/<user>/linux-learning-level:latest`

2. 推送到 GitHub Container Registry (ghcr.io)

### 启用 GitHub Actions

1. 进入你的 GitHub 仓库
2. Settings → Actions → General
3. 确保 "Read and write permissions" 被选中
4. 保存

---

## 手动构建（开发环境）

```bash
# 构建所有镜像
docker-compose -f docker-compose.prod.yml build

# 启动服务
docker-compose -f docker-compose.prod.yml up -d
```

---

## 服务说明

| 服务 | 端口 | 镜像 |
|------|------|------|
| Frontend | 8080 | ghcr.io/.../linux-learning-frontend |
| Backend | 3001 | ghcr.io/.../linux-learning-backend |
| Level | - | ghcr.io/.../linux-learning-level |

---

## 常用命令

```bash
# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新镜像
docker-compose pull && docker-compose up -d
```

---

## 注意事项

1. **Docker Socket**: 后端需要挂载 `/var/run/docker.sock` 来创建学习容器
2. **内存要求**: 建议 2GB+ 可用内存
3. **首次启动**: 需要几分钟拉取镜像
