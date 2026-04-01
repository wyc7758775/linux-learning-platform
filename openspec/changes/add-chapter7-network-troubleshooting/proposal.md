# Proposal: add-chapter7-network-troubleshooting

## Why

前六章覆盖了终端基础、权限管理、事故响应、部署、DevOps 和脚本编程，但缺少一个高频核心技能：**网络排查**。

现实中运维工程师每天都要面对：
- "服务启动了但访问不了" → 查端口监听、查连通性
- "API 调用返回 500" → curl 调试 HTTP 状态码和响应头
- "网站打不开" → DNS 解析排查
- "服务器响应慢" → 查 TCP 连接状态、连接数统计

网络排查是运维的「听诊器」，是事故响应的前置技能。第 7 章"网络排查"补齐这块能力，让学习者掌握从网络接口 → DNS → 端口 → HTTP 的完整排查链路。

## What Changes

新增第 7 章"网络排查"，包含 10 个关卡（Level 51-60）：

| # | 关卡名 | 场景 | 核心知识点 |
|---|--------|------|-----------|
| 51 | 网卡在哪 | 新服务器报到，查看网络接口和 IP 地址 | `ip addr`, `ifconfig` |
| 52 | 谁在监听 | 同事说 Nginx 起了但访问不了，检查端口监听 | `ss -tlnp`, 端口概念 |
| 53 | 本地服务测试 | 确认本地 Nginx 是否正常响应 | `curl localhost`, HTTP 基础 |
| 54 | 响应头诊断 | 页面行为异常，查看 HTTP 响应头 | `curl -I`, 状态码 200/301/404/500 |
| 55 | 详细请求追踪 | API 调用超时，需要看完整的请求响应过程 | `curl -v`, 请求头/响应头/SSL |
| 56 | DNS 解析排查 | 线上域名访问不了，先查 DNS 解析 | `nslookup`, `getent hosts` |
| 57 | 端口连通性 | 测试远程数据库端口是否可达 | `nc -zv`, TCP 握手 |
| 58 | 路由走向 | 网络不通，查看数据包经过哪些节点 | `ip route`, 默认网关 |
| 59 | 连接数统计 | 服务器响应变慢，统计 TCP 连接状态 | `ss -s`, `ss -tan` |
| 60 | 综合排查 | 完整故障排查：网络接口 → DNS → 端口 → HTTP 层层递进 | 综合运用所有工具 |

## Impact

- **前端**：在 `App.tsx` 的 `LEVELS` 数组中追加 Level 51-60（10 个网络排查关卡）
- **前端**：在 `Progress.tsx` 的 `chapterConfig` 中添加第 7 章配置
- **后端验证**：在 `validator.ts` 的 `LEVEL_VALIDATIONS` 中追加 Level 51-60 的验证规则
- **Docker 镜像**：需在 `Dockerfile.level` 中添加 `bind-tools` 包（提供 nslookup/dig）
- **容器初始化**：部分关卡需要在 `containerManager.ts` 的 `LEVEL_SETUP_COMMANDS` 中预启动 nginx 服务
- **E2E 测试**：在 `levels.e2e.test.ts` 中添加 Chapter 7 测试用例
