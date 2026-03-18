# Linux 命令行学习平台

一个交互式的 Linux 命令行学习平台，通过关卡式学习模式帮助用户掌握 Linux 技能。

## 技术栈

- **前端**: React + TypeScript + Vite + Tailwind CSS
- **终端**: xterm.js
- **后端**: Node.js + Express + TypeScript + Socket.IO
- **容器**: Docker (为每个关卡提供隔离的 Linux 环境)

## 快速开始

### 前置要求

- Node.js 18+
- Docker

### 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 构建并运行

1. **构建 Docker 镜像**:
```bash
cd docker
docker build -f Dockerfile.level -t linux-learning-level:latest .
```

2. **启动后端服务器**:
```bash
cd ../backend
npm run dev
```

3. **启动前端开发服务器** (新终端):
```bash
cd frontend
npm run dev
```

4. **访问应用**: 打开浏览器访问 http://localhost:5173

### 使用 Docker Compose (可选)

```bash
docker-compose up
```

## 项目结构

```
linux-learning-platform/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/
│   │   │   ├── Terminal/     # xterm.js 终端组件
│   │   │   ├── Level/        # 关卡展示组件
│   │   │   └── Progress/     # 进度组件
│   │   ├── services/         # WebSocket 服务
│   │   └── App.tsx
│   └── package.json
├── backend/                  # 后端项目
│   ├── src/
│   │   ├── docker/           # Docker 容器管理
│   │   ├── levels/           # 关卡验证逻辑
│   │   ├── socket/           # WebSocket 处理
│   │   └── index.ts
│   └── package.json
├── levels/                   # 关卡配置文件 (YAML)
├── docker/                   # Dockerfile
└── docker-compose.yml
```

## 关卡规划

### 第一章：终端初识 (5关)
1. ls - 查看目录内容
2. pwd - 显示当前路径
3. cd - 切换目录
4. clear - 清屏
5. history - 命令历史

### 第二章：文件操作 (8关)
6. touch - 创建空文件
7. mkdir - 创建目录
8. rm - 删除文件
9. rmdir - 删除空目录
10. rm -r - 递归删除
11. cp - 复制文件
12. mv - 移动/重命名
13. 综合练习

### 第三章：查看与编辑 (6关)
14. cat - 查看文件
15. head/tail - 查看头尾
16. less - 分页浏览
17. nano - 编辑器
18. echo + > - 写入文件
19. echo + >> - 追加内容

更多关卡陆续添加中...

## 开发指南

### 添加新关卡

1. 在 `levels/` 目录下创建或编辑 YAML 文件
2. 在 `backend/src/levels/validator.ts` 中添加验证规则
3. 在前端 `App.tsx` 中添加关卡配置

### 验证类型

- `command`: 检查是否使用了目标命令
- `output_contains`: 检查输出是否包含特定内容
- `file_exists`: 检查文件是否存在
- `directory_exists`: 检查目录是否存在
- `file_content`: 检查文件内容

## License

MIT
