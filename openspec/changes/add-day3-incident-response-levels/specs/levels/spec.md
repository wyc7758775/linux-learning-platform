# Spec: Day 3 Incident Response Levels

## ADDED Requirements

### Requirement: Level 13 - 第一响应

系统 **SHALL** 提供关卡 13"第一响应"，用户使用进程查看命令找出占用 CPU 最高的进程名。

场景设定：凌晨 2:17 收到告警，服务器 CPU 飙至 99%。

#### Scenario: 找出高 CPU 进程
- **Given**: 容器内有一个名为 `stress-worker` 的进程持续占用高 CPU
- **When**: 用户执行能列出进程并按 CPU 排序的命令（如 `ps aux --sort=-%cpu | head`）
- **Then**: 命令输出包含 `stress-worker`，关卡完成

---

### Requirement: Level 14 - 磁盘告急

系统 **SHALL** 提供关卡 14"磁盘告急"，用户使用磁盘用量命令找出 `/var/log` 下占用最大的目录。

场景设定：日志分区使用率 95%，需要找出"磁盘杀手"。

#### Scenario: 找出最大日志目录
- **Given**: `/var/log` 下有多个子目录，其中 `/var/log/nginx` 预设为最大
- **When**: 用户执行能统计目录大小并排序的命令（如 `du -sh /var/log/* | sort -rh | head`）
- **Then**: 命令输出第一行包含 `/var/log/nginx`，关卡完成

---

### Requirement: Level 15 - 端口被占

系统 **SHALL** 提供关卡 15"端口被占"，用户找出占用 8080 端口的进程名。

场景设定：尝试重启应用服务，报错"Address already in use: 8080"。

#### Scenario: 找出占用 8080 端口的进程
- **Given**: 容器内有进程 `nc` 监听 8080 端口
- **When**: 用户执行能查看端口占用的命令（如 `ss -tlnp | grep 8080` 或 `lsof -i :8080`）
- **Then**: 命令输出包含 `8080` 和进程信息，关卡完成

---

### Requirement: Level 16 - 日志追踪

系统 **SHALL** 提供关卡 16"日志追踪"，用户从 nginx 日志中过滤出所有 HTTP 500 错误记录。

场景设定：用户反馈页面报错，需要从日志中确认 500 错误的存在。

#### Scenario: 过滤 500 错误日志
- **Given**: `/var/log/nginx/access.log` 包含预埋的 47 条 500 状态码记录
- **When**: 用户执行包含 `grep` 过滤 500 状态码的命令
- **Then**: 命令输出行数 ≥ 40（容许用户匹配方式略有差异），关卡完成

---

### Requirement: Level 17 - 统计告警

系统 **SHALL** 提供关卡 17"统计告警"，用户统计 `app.log` 中 ERROR 级别日志的总数量。

场景设定：老板在群里问"今天报了多少个 ERROR？"

#### Scenario: 统计 ERROR 数量
- **Given**: `/var/log/app/app.log` 包含预埋的 312 条 ERROR 记录
- **When**: 用户执行包含 `grep` 和 `wc -l` 的组合命令
- **Then**: 命令输出为数字 312（允许末尾换行），关卡完成

---

### Requirement: Level 18 - IP 追凶

系统 **SHALL** 提供关卡 18"IP 追凶"，用户从 nginx access.log 中找出访问量最大的 IP。

场景设定：怀疑有爬虫或攻击者在刷接口，需要找出可疑 IP。

#### Scenario: 找出访问量最大的 IP
- **Given**: access.log 中 IP `10.66.6.6` 的请求量远超其他 IP（预埋为第一名）
- **When**: 用户执行提取 IP、统计频次、排序的管道命令（如 `awk '{print $1}' | sort | uniq -c | sort -rn | head -5`）
- **Then**: 命令输出第一行包含 `10.66.6.6`，关卡完成

---

### Requirement: Level 19 - 时间取证

系统 **SHALL** 提供关卡 19"时间取证"，用户精确统计告警时段（02:17）内的 500 错误数量。

场景设定：需要向技术委员会汇报：事故那一分钟内，究竟发生了多少次 500 错误？

#### Scenario: 时间范围过滤 + 状态码过滤
- **Given**: access.log 中 02:17 时段内预埋 23 条 500 错误记录
- **When**: 用户执行同时过滤时间和状态码的管道命令
- **Then**: 命令输出数字为 23，关卡完成

---

### Requirement: Level 20 - 终极取证

系统 **SHALL** 提供关卡 20"终极取证"，用户找出告警时段内请求量最多的 IP 及其精确请求次数。

场景设定：复盘报告需要最关键的证据：谁在事故期间发起了最多的请求？

#### Scenario: 组合过滤 + 统计 + 排序
- **Given**: access.log 中 02:17 时段内 `10.66.6.6` 发出 182 次请求，远超其他 IP
- **When**: 用户执行过滤时段、提取 IP、统计、排序的完整管道命令
- **Then**: 命令输出包含 `182` 和 `10.66.6.6`，关卡完成

---

## MODIFIED Requirements

### Requirement: 扩展前端关卡定义

系统 **MUST** 修改 `frontend/src/App.tsx` 中的 LEVELS 数组，添加 Level 13–20 的定义，包含 `objective` 和 `knowledgeCards` 字段。

#### Scenario: 显示 Chapter 3 关卡
- **Given**: 用户查看关卡列表
- **When**: 应用加载
- **Then**: 显示 Chapter 3: 事故响应 的 8 个新关卡

---

### Requirement: 扩展后端验证规则

系统 **MUST** 修改 `backend/src/levels/validator.ts`，新增 `output_number`、`output_matches`、`output_lines_gte` 验证类型，并添加 Level 13–20 的验证配置。

#### Scenario: 验证管道命令输出
- **Given**: 用户在 Chapter 3 关卡执行管道命令
- **When**: 命令执行完毕
- **Then**: 后端根据输出内容（而非命令本身）判断关卡是否通过
