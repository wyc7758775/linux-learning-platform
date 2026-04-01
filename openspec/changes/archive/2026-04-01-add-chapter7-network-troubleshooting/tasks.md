# Tasks: add-chapter7-network-troubleshooting

- [x] 在 `Dockerfile.level` 中添加 `bind-tools` 和 `netcat-openbsd` 包
- [x] 重新构建 Docker 镜像：`docker build -f docker/Dockerfile.level -t linux-learning-level:latest .`
- [x] 在 `Progress.tsx` 的 `chapterConfig` 中添加第 7 章配置（网络排查、配色、图标）
- [x] 在 `App.tsx` 的 `LEVELS` 数组中追加 Level 51-60（10 个网络排查关卡）
- [x] 在 `containerManager.ts` 的 `LEVEL_SETUP_COMMANDS` 中添加 Level 51-60 的容器初始化命令
- [x] 在 `validator.ts` 的 `LEVEL_VALIDATIONS` 中添加 Level 51-60 的验证规则
- [x] TypeScript 编译通过，前端正确显示第 7 章 10 个关卡
- [x] 端到端测试：Chapter 7 全部 10 关通过（Level 51-60）+ 修复了 execAndValidate 的 completed 解构 bug
