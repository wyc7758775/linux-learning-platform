# Design: 错题本数据链路 + 合并策略

## 架构决策

### 前端驱动录入（非后端）

Socket handler 中无 userId，有两种方案打通链路：

| 方案 | 改动 | 优缺点 |
|------|------|--------|
| A. 前端录入 | 后端 socket 加 completed 字段，前端调 REST API | 改动最小，复用现有 API |
| B. 后端录入 | Socket.IO 加 auth 中间件提取 userId | 需改 socket 连接逻辑 |

**选择方案 A**：后端在 `terminal:output` 事件中增加 `completed` 字段（已有），前端检测 `completed === false` 且用户已登录时，调用 `POST /api/wrong-records`。

### 合并策略：按错误类型

合并键：`(user_id, level_id, error_type)`

同一用户在同一关卡犯同类错误 → 更新为最新的 command/output，attempt_count+1。

6 种错误类型沿用现有 ErrorAnalysis regex：

```
permission  — /permission denied|are you root/i
notfound    — /no such file|not found|cannot access/i
syntax      — /syntax error/i
command     — /command not found/i
empty       — output 或 command 为空
logic       — 以上均不匹配（默认）
```

### 探索命令过滤

以下命令验证失败时不记录错题（纯浏览行为）：

```
ls, cat, pwd, cd, echo, man, help, which, type, whoami, clear, history, head, tail, less, more
```

判断依据：取命令首个 token（空格分割），匹配白名单。

### 增强分析模板（非 AI）

不接入外部 LLM，扩展规则引擎。每种错误类型提供：
- 中文标签 + 描述
- 4-5 条可操作建议（advice）
- 相关命令列表（relatedCommands）

## 数据流

```
用户输入命令
  → Terminal.tsx 保存 lastCommandRef
  → socket emit terminal:input
  → 后端 handleTerminalInput → validateLevel
  → socket emit terminal:output { output, currentDir, completed }
  → Terminal.tsx handleOutput
    → completed === false?
      → 调用 onCommandResult(command, output, false)
        → App.tsx handleCommandResult
          → 已登录? 非探索命令? 关卡未完成?
            → classifyError(command, output) → errorType
            → wrongRecordApi.create(levelId, command, output, hint, errorType)
              → 后端 UPSERT → wrong_records 表
```

## DB Schema 变更

```sql
-- 新增列（ALTER ADD COLUMN，try/catch 防重复执行）
ALTER TABLE wrong_records ADD COLUMN error_type TEXT NOT NULL DEFAULT 'logic';
ALTER TABLE wrong_records ADD COLUMN attempt_count INTEGER NOT NULL DEFAULT 1;

-- 合并唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_wrong_records_merge
  ON wrong_records(user_id, level_id, error_type);
```

## UPSERT SQL

```sql
INSERT INTO wrong_records (user_id, level_id, error_type, detail, attempt_count, created_at)
VALUES (?, ?, ?, ?, 1, unixepoch())
ON CONFLICT(user_id, level_id, error_type) DO UPDATE SET
  detail = excluded.detail,
  attempt_count = attempt_count + 1,
  created_at = unixepoch()
```
