# Tasks: add-chapter7-network-troubleshooting

- [ ] 在 `Dockerfile.level` 中添加 `bind-tools` 包（提供 nslookup/dig 命令）
- [ ] 重新构建 Docker 镜像：`docker build -f docker/Dockerfile.level -t linux-learning-level:latest .`
- [ ] 在 `Progress.tsx` 的 `chapterConfig` 中添加第 7 章配置（网络排查、配色、图标）
- [ ] 在 `App.tsx` 的 `LEVELS` 数组中追加 Level 51-60（10 个网络排查关卡）
- [ ] 在 `containerManager.ts` 的 `LEVEL_SETUP_COMMANDS` 中添加 Level 51-60 的容器初始化命令
- [ ] 在 `validator.ts` 的 `LEVEL_VALIDATIONS` 中添加 Level 51-60 的验证规则
- [ ] TypeScript 编译通过，前端正确显示第 7 章 10 个关卡
- [ ] 端到端测试：添加 Chapter 7 E2E 测试用例（Level 51-60）
