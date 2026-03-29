# user-progress Specification

## Purpose
TBD - created by archiving change add-user-account-system. Update Purpose after archive.
## Requirements
### Requirement: 服务端进度持久化

系统 **SHALL** 将用户的学习进度存储在服务端数据库中，而非 localStorage。进度数据 **SHALL** 包含当前关卡编号和已完成关卡列表（以 JSON 数组存储，如 [1, 2, 5, 8]）。每个用户 **SHALL** 独立维护一份进度。

#### Scenario: 获取用户进度

- Given 用户已登录，已完成关卡 [1, 2, 5]，当前关卡为 6
- When 调用 GET /api/user/progress
- Then 返回 `{ currentLevel: 6, completedLevels: [1, 2, 5] }`

#### Scenario: 更新用户进度

- Given 用户已登录，当前完成关卡 6
- When 调用 PUT /api/user/progress，body: `{ currentLevel: 7, completedLevels: [1,2,5,6] }`
- Then 返回 200，数据库更新

---

### Requirement: localStorage 进度迁移

系统 **SHALL** 支持已有用户首次登录后将 localStorage 中的进度迁移至服务端。迁移策略 **SHALL** 取 localStorage 和服务端进度的并集。迁移 **SHALL** 是一次性操作，迁移后前端 **SHALL** 不再依赖 localStorage 存储进度。

#### Scenario: 首次登录迁移进度

- Given localStorage 中有 completedLevels: [1, 2, 3, 4, 5]，服务端进度为空
- When 调用 POST /api/user/progress/migrate
- Then 服务端保存 completedLevels: [1, 2, 3, 4, 5]，返回合并后的进度

#### Scenario: 迁移时合并已有进度

- Given localStorage 中有 completedLevels: [1, 3, 5]，服务端已有 completedLevels: [1, 2, 4]
- When 调用 POST /api/user/progress/migrate
- Then 服务端保存 completedLevels: [1, 2, 3, 4, 5]（并集）

---

### Requirement: 错题记录占位

系统 **SHALL** 为后续"错题记录"功能预留 wrong_records 数据表，包含 user_id, level_id, detail (JSON), created_at 字段。当前版本 **SHALL NOT** 实现写入逻辑，仅建表占位。detail 字段 **SHALL** 为 JSON 类型，后续定义具体结构。

#### Scenario: 数据库包含 wrong_records 表

- Given 系统初始化完成
- Then wrong_records 表已创建，包含 id, user_id, level_id, detail, created_at 字段

