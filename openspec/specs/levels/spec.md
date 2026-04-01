# levels Specification

## Purpose
TBD - created by archiving change add-chapter7-network-troubleshooting. Update Purpose after archive.
## Requirements
### Requirement: 查看网络接口 (Level 51)

系统 SHALL 提供关卡，要求学习者使用 `ip addr` 命令查看容器的网络接口和 IP 地址。验证器 MUST 检查命令输出包含 `inet`。

#### Scenario: 查看网卡配置
- Given 容器已创建
- When 学习者执行 `ip addr` 或 `ifconfig`
- Then 输出中包含 `inet`（显示 IP 地址信息）

### Requirement: 检查端口监听 (Level 52)

系统 SHALL 提供关卡，要求学习者使用 `ss -tlnp` 确认 Nginx 端口 80 在监听。容器初始化 MUST 预启动 Nginx。

#### Scenario: 确认服务端口监听状态
- Given Nginx 已通过容器初始化启动
- When 学习者执行 `ss -tlnp` 或 `netstat -tlnp`
- Then 输出中包含 `:80`，确认 80 端口在监听

### Requirement: 测试本地服务 (Level 53)

系统 SHALL 提供关卡，要求学习者使用 `curl` 测试本地 Nginx 服务。验证器 MUST 检查输出包含 HTML 内容。

#### Scenario: 访问本地 HTTP 服务
- Given Nginx 已启动并监听 80 端口
- When 学习者执行 `curl localhost` 或 `curl http://127.0.0.1`
- Then 输出中包含 `html`（返回 HTML 内容）

### Requirement: HTTP 响应头诊断 (Level 54)

系统 SHALL 提供关卡，要求学习者使用 `curl -I` 查看 HTTP 响应头和状态码。验证器 MUST 检查输出包含状态码 200。

#### Scenario: 查看 HTTP 响应头
- Given Nginx 已启动
- When 学习者执行 `curl -I localhost`
- Then 输出中包含 `200`（HTTP 200 OK 状态码）

### Requirement: 详细请求追踪 (Level 55)

系统 SHALL 提供关卡，要求学习者使用 `curl -v` 查看完整 HTTP 请求响应过程。验证器 MUST 检查输出包含 HTTP 协议详情。

#### Scenario: 追踪 HTTP 请求详情
- Given Nginx 已启动
- When 学习者执行 `curl -v localhost`
- Then 输出中包含 HTTP 详情信息

### Requirement: DNS 解析排查 (Level 56)

系统 SHALL 提供关卡，要求学习者使用 DNS 查询命令排查域名解析。Docker 镜像 MUST 预装 bind-tools 包。

#### Scenario: 查询 DNS 解析
- Given 容器已安装 bind-tools
- When 学习者执行 `nslookup localhost` 或 `getent hosts localhost`
- Then 输出中包含 `127.0.0.1`

### Requirement: 端口连通性测试 (Level 57)

系统 SHALL 提供关卡，要求学习者使用 `nc -zv` 测试 TCP 端口连通性。验证器 MUST 检查命令执行成功。

#### Scenario: 测试端口可达性
- Given Nginx 已启动监听 80 端口
- When 学习者执行 `nc -zv localhost 80`
- Then 输出中包含端口连接成功信息

### Requirement: 路由表查看 (Level 58)

系统 SHALL 提供关卡，要求学习者使用 `ip route` 查看路由表。验证器 MUST 检查输出包含默认路由信息。

#### Scenario: 查看路由信息
- Given 容器已创建
- When 学习者执行 `ip route` 或 `route -n`
- Then 输出中包含 `default`（显示默认路由）

### Requirement: TCP 连接统计 (Level 59)

系统 SHALL 提供关卡，要求学习者使用 `ss -s` 分析 TCP 连接状态。验证器 MUST 检查输出包含 TCP 统计信息。

#### Scenario: 统计 TCP 连接
- Given Nginx 已启动
- When 学习者执行 `ss -s`
- Then 输出中包含 TCP 连接统计

### Requirement: 综合网络故障排查 (Level 60)

系统 SHALL 提供综合关卡，模拟完整网络故障排查流程。容器初始化 MUST NOT 启动 Nginx，学习者 SHALL 自行发现并修复故障。

#### Scenario: 综合排查 Web 服务故障
- Given Nginx 未启动，但 HTML 页面已就绪
- When 学习者启动 Nginx 并用 curl 验证
- Then curl localhost 输出包含 `html`

