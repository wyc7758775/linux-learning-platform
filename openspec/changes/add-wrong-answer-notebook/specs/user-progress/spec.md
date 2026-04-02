## MODIFIED Requirements

### Requirement: 错题记录占位

系统 **SHALL** 记录用户通关失败尝试到 wrong_records 表。每次用户执行命令且关卡验证失败时，系统 **SHALL** 写入一条记录，包含 user_id、level_id 和 detail（JSON）。detail **SHALL** 包含 command（执行的命令）、output（命令输出，截断至 500 字符）、expectedHint（关卡提示）。系统 **SHALL** 提供 GET /api/wrong-records 接口按 level_id 分组返回当前用户错题。系统 **SHALL** 支持 DELETE /api/wrong-records/:id 删除单条记录。

#### Scenario: 验证失败时记录错题

- Given 用户已登录，正在挑战关卡 6
- When 用户执行命令 `useradd test` 且验证失败
- Then wrong_records 表新增一条记录，detail 包含 `{ command: "useradd test", output: "...", expectedHint: "..." }`

#### Scenario: 获取错题列表

- Given 用户已有错题记录涉及关卡 6 和关卡 10
- When 调用 GET /api/wrong-records
- Then 返回按 level_id 分组的错题列表

#### Scenario: 删除错题

- Given 用户有错题记录 id=5
- When 调用 DELETE /api/wrong-records/5
- Then 记录被删除，返回 200

## ADDED Requirements

### Requirement: Tab 导航切换

系统 **SHALL** 在 header 标题旁提供「学习」和「错题本」两个 Tab 按钮，允许用户在主学习界面和错题本之间切换。当前激活的 Tab **SHALL** 有视觉高亮。切换 Tab **SHALL NOT** 影响 WebSocket 连接和终端状态。错题本 Tab **SHALL** 显示未解决错题数量 badge。

#### Scenario: 切换到错题本

- Given 用户在主学习界面
- When 用户点击「错题本」Tab
- Then 主内容区显示错题本视图，Tab 高亮切换到「错题本」

#### Scenario: 错题数量 badge

- Given 用户有 3 条未删除的错题
- Then 「错题本」Tab 旁显示数字 badge "3"

### Requirement: 错题本展示

系统 **SHALL** 以关卡为分组展示错题列表。每组 **SHALL** 显示关卡标题和错题数量。点击关卡组 **SHALL** 展开该关卡下的所有错题记录。每条记录 **SHALL** 显示执行的命令、命令输出和关卡提示。系统 **SHALL** 支持折叠/展开交互。当错题本为空时，**SHALL** 显示空状态提示。

#### Scenario: 展开关卡错题

- Given 关卡 6 有 2 条错题记录
- When 用户点击关卡 6 分组
- Then 展开显示 2 条错题详情

#### Scenario: 空错题本

- Given 用户没有任何错题记录
- Then 显示空状态提示，如"暂无错题记录，继续加油！"

### Requirement: AI 知识点扩展

系统 **SHALL** 提供「AI 解析」功能，将单条错题扩展为完整知识点。点击「AI 解析」按钮后，系统 **SHALL** 调用后端 API，后端 **SHALL** 将关卡信息、错误命令、期望结果组合为 prompt 调用 LLM，返回 Markdown 格式的知识点（包含错误原因分析、正确做法、相关知识点扩展）。扩展结果 **SHALL** 缓存在后端，避免重复调用。LLM 调用期间前端 **SHALL** 显示加载状态。

#### Scenario: AI 扩展知识点

- Given 用户有错题记录 id=3（关卡 6，执行了错误命令）
- When 用户点击「AI 解析」按钮
- Then 后端调用 LLM，返回包含错误分析、正确做法和知识点的 Markdown 内容
- And 前端以格式化方式展示该内容

#### Scenario: AI 扩展加载中

- Given 用户点击了「AI 解析」
- When LLM 尚未返回结果
- Then 按钮显示加载状态（spinner + "解析中..."），禁止重复点击

#### Scenario: 缓存 AI 结果

- Given 错题 id=3 已生成 AI 解析
- When 用户再次点击「AI 解析」
- Then 直接返回缓存结果，不重新调用 LLM
