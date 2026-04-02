# Proposal: 错题本功能

## Why

用户在学习过程中会多次尝试失败，但当前系统不记录失败信息。错题本功能帮助用户回顾做错的关卡，理解错误原因，并通过 AI 将零散的错误记录扩展为完整的知识点总结，形成系统化的学习资料。

已有基础设施：`wrong_records` 表已建表占位（`id, user_id, level_id, detail, created_at`），需要激活并扩展。

## What Changes

### 后端

1. **激活 wrong_records 写入**：当用户执行命令且验证失败时，记录到 wrong_records 表
2. **新增 API 端点**：
   - `GET /api/wrong-records` — 获取当前用户的错题列表（按 level_id 分组）
   - `DELETE /api/wrong-records/:id` — 删除单条错题
   - `POST /api/wrong-records/:id/expand` — 调用 AI 将错题扩展为知识点说明
3. **detail 字段结构定义**：`{ command: string, expectedHint: string, timestamp: number }`

### 前端

1. **顶部 Tab 导航**：在 header 标题旁添加「学习」和「错题本」两个 Tab，支持页面切换
2. **错题本页面**：
   - 按关卡分组展示错题列表
   - 每条记录可展开查看详情（执行的命令、期望提示）
   - 「AI 解析」按钮：调用后端 API 将错题扩展为完整知识点
   - 支持删除单条记录

## Impact

- **数据库**：wrong_records 表从占位变为活跃写入，可能数据量增长较快，需考虑清理策略
- **前端路由**：App.tsx 需要支持 Tab 切换视图（学习主界面 / 错题本），不新增路由，用 state 控制
- **AI 依赖**：AI 扩展功能需要外部 LLM API（可配置），首次引入非基础设施外部依赖
- **用户体验**：学习主界面布局不变，错题本为新增页面
