# Proposal: 补全错题本功能 — 自动记录 + 去重合并 + 增强分析

## Why

错题本 UI 已完整实现（列表、详情、统计、暗色主题、响应式），但存在三个问题：

1. **数据链路断裂**：`socket/handlers.ts` 验证失败时未写入 `wrong_records`，错题本在正常使用中永远为空
2. **无去重机制**：同一关卡同类错误会产生大量重复记录
3. **分析过于简单**：ErrorAnalysis 仅输出一行描述，缺少可操作的学习建议

## What Changes

### 后端

1. **DB Schema 迁移**：`wrong_records` 表新增 `error_type`（TEXT）和 `attempt_count`（INTEGER）列，添加 `(user_id, level_id, error_type)` 唯一索引
2. **UPSERT 逻辑**：`POST /api/wrong-records` 改为 INSERT ON CONFLICT DO UPDATE，同用户+同关卡+同错误类型 → 更新 detail、attempt_count+1、刷新 created_at
3. **terminal:output 事件**：增加 `completed` 字段，前端据此判断验证是否通过
4. **GET 端点**：返回值增加 `errorType`、`attemptCount`
5. **seed 数据**：测试数据补充 `error_type`

### 前端

1. **错误分类工具**：新建 `utils/classifyError.ts`，提取 ErrorAnalysis 中的 regex 分类逻辑为独立函数，同时增加探索性命令过滤（`ls`/`cat`/`pwd` 等不记录）
2. **Terminal 组件**：保存最近命令引用，`terminal:output` 返回 `completed: false` 时通过回调通知父组件
3. **App.tsx 录入逻辑**：收到验证失败回调后，已登录用户自动调用 `POST /api/wrong-records`（带 errorType）
4. **WrongNotebook UI**：
   - 记录卡片显示尝试次数 badge（attemptCount > 1 时）
   - ErrorAnalysis 改用 classifyError() 增强模板：详细描述 + 4-5 条建议 + 相关命令标签
5. **API 层**：`wrongRecordApi.create` 增加 `errorType` 参数

### 不做

- 不接入外部 AI API（使用增强规则模板替代）
- 不支持游客错题本（需登录）
- 暂不实现数据清理上限

## Impact

- **后端改动 3 个文件**：`db/index.ts`（schema）、`routes/wrongRecords.ts`（UPSERT + GET）、`index.ts`（socket 事件 1 行）
- **前端改动 4 个文件**：新建 `utils/classifyError.ts`、改 `Terminal.tsx`（回调）、`App.tsx`（录入）、`WrongNotebook.tsx`（UI 增强）、`api.ts`（参数）
- 无破坏性变更，DB 迁移向后兼容（ALTER ADD COLUMN + DEFAULT）
- 错误类型固定 6 种：permission / notfound / syntax / command / empty / logic
