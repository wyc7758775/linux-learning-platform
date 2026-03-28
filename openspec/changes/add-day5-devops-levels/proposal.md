# Proposal: add-day5-devops-levels

## Why

当前四章覆盖了基础命令、权限管理、事故响应、部署上线。但真实软件开发中，部署之后还有大量 DevOps 和日常开发工作：环境隔离、依赖管理、自动化脚本、定时任务、版本控制集成、容器化部署等。这些是每个开发者在实际工作中高频接触的场景。

第五章"DevOps 实战"聚焦**软件开发生命周期中部署之后的环节**，让学习者掌握开发者日常必备的 Linux 技能。

## What Changes

新增第 5 章"DevOps 实战"，包含 10 个关卡（Level 31-40）：

| # | 关卡名 | 场景 | 核心命令 |
|---|--------|------|----------|
| 31 | 环境变量泄漏 | 生产环境的数据库密码硬编码在代码里，需要用环境变量替代 | `export`, `env`, `echo $VAR` |
| 32 | 编写启动脚本 | 每次部署都要手动执行一堆命令，写个 shell 脚本一键启动 | `bash script.sh`, `chmod +x` |
| 33 | 传递参数 | 启动脚本需要接受环境参数（dev/staging/prod） | `$1`, `$#`, `if/else` in bash |
| 34 | 定时备份 | 数据库需要每天凌晨自动备份 | `crontab -e`, cron 表达式 |
| 35 | 日志轮转 | 日志文件越来越大，需要自动切割归档 | `logrotate` 配置 |
| 36 | SSH 免密登录 | 每次登录服务器都要输密码，配置免密登录 | `ssh-keygen`, `ssh-copy-id` |
| 37 | 同步文件 | 需要把构建产物同步到多台服务器 | `rsync`, `scp` |
| 38 | 进程守护 | Node.js 服务挂了没人管，用 systemd 守护 | `systemctl`, 编写 service 文件 |
| 39 | 磁盘监控告警 | 写一个监控脚本，磁盘使用超 80% 自动告警 | `df`, `awk`, 条件判断脚本 |
| 40 | CI 流水线 | 模拟 GitHub Actions 本地验证：拉代码 → 安装依赖 → 测试 → 构建 | 综合脚本，`&&` 链式执行 |

## Impact

- **新增文件**：关卡数据定义（在 App.tsx 的 levels 数组中追加 10 项）
- **后端验证**：需在 validator.ts 中支持 `cron_exists`、`service_running` 等新验证类型
- **章节数据**：在 Progress 组件的 chapterConfig 中添加第 5 章配置
- **Docker 镜像**：可能需要预装 `rsync`、`logrotate`、`systemd`（或模拟）
