# Linux Learning Platform - Docker 部署指南

## 快速部署到 NAS

### 1. 构建镜像

```bash
# 在项目根目录执行
docker-compose -f docker-compose.prod.yml build
```

### 2. 启动服务

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. 访问应用

打开浏览器访问 `http://<NAS-IP>:80`

## 服务说明

| 服务 | 端口 | 说明 |
|------|------|------|
| frontend | 80 | Nginx 静态文件服务 |
| backend | 3001 (内部) | Node.js API 服务 |
| level-image | - | 关卡容器镜像（预构建） |

## 注意事项

1. **Docker Socket 挂载**: 后端服务需要挂载 `/var/run/docker.sock` 来创建学习容器
2. **数据持久化**: 用户进度保存在浏览器的 localStorage 中
3. **资源要求**:
   - 最小内存: 2GB
   - 推荐内存: 4GB+
   - 需要支持 Docker

## 常用命令

```bash
# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 停止服务
docker-compose -f docker-compose.prod.yml down

# 重新构建并启动
docker-compose -f docker-compose.prod.yml up -d --build

# 清理未使用的镜像
docker image prune -f
```

## 单独构建关卡镜像

```bash
docker build -f docker/Dockerfile.level -t linux-learning-level:latest .
```
