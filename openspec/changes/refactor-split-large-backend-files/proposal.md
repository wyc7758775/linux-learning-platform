# Proposal: 拆分超长后端文件到 200 行以内

## Why

当前后端有 3 个文件超过 200 行：

1. `backend/src/docker/containerManager.ts` — 820 行
2. `backend/src/levels/validator.ts` — 274 行
3. `backend/src/db/index.ts` — 203 行

这些文件都已经承担了过多职责：

1. **容器层过重**：`containerManager.ts` 同时负责 Docker 镜像、容器池、会话生命周期、命令执行、路径处理、关卡预置环境和文件检查
2. **验证层混杂**：`validator.ts` 同时存放关卡规则数据、输出清洗、不同验证类型的执行逻辑和补偿逻辑
3. **数据库入口膨胀**：`db/index.ts` 同时负责连接初始化、schema 创建、字段探测、错题迁移、历史数据修复和错误类型推断

继续把需求堆在这 3 个文件里，会直接带来三个问题：

1. **边界模糊**：修改某个细节时，容易顺手改坏同文件里的其他职责
2. **测试困难**：大部分逻辑没有清晰切口，不利于单测和回归验证
3. **违反当前模块约束**：项目已经明确要求调用层 / 验证层 / 容器层分离，大文件会持续侵蚀这个边界

## What Changes

### 全局约束

1. 本次是**纯后端结构重构**，不改接口契约，不改业务行为
2. 当前已超过 200 行的后端文件，拆分后每个 `ts` 文件都以 **200 行为硬上限**
3. 增加后端行数校验脚本，例如 `backend/scripts/check-max-lines.mjs`
4. 将 `npm run lint:lines` 或等价脚本加入 `backend/package.json`，避免后续回弹

### 文件级拆分提案

#### 1. `backend/src/docker/containerManager.ts`（820 → 7~10 个文件）

现状问题：

- 会话管理、容器池、镜像准备、命令执行、路径处理、关卡环境初始化都堆在一个类里
- `LEVEL_SETUP_COMMANDS` 和 `PRIVILEGED_COMMANDS` 这类静态配置挤占了大量篇幅
- 文件检查类方法和容器生命周期类方法耦合在一起，不利于局部测试

建议拆分：

```text
backend/src/docker/containerManager.ts              <= 180
backend/src/docker/types.ts                         <= 60
backend/src/docker/constants.ts                     <= 120
backend/src/docker/levelSetup.ts                    <= 180
backend/src/docker/pathUtils.ts                     <= 80
backend/src/docker/history.ts                       <= 60
backend/src/docker/commandPolicy.ts                 <= 120
backend/src/docker/containerFactory.ts              <= 180
backend/src/docker/sessionLifecycle.ts              <= 180
backend/src/docker/fileChecks.ts                    <= 180
```

拆分原则：

- `containerManager.ts` 只保留对外编排接口
- `levelSetup.ts` 承载 `LEVEL_SETUP_COMMANDS` 和初始目录/预置 history 规则
- `containerFactory.ts` 负责镜像检查、建镜像、创建容器、停容器、容器运行态检查
- `sessionLifecycle.ts` 负责 session 创建、过期、重建、清理、连接池补货
- `fileChecks.ts` 负责 `checkFileExists` / `getFileContent` / `getFilePermission` / `checkUserExists` 等查询型方法
- `commandPolicy.ts` 负责 sudo 提升、超时处理、命令执行包装
- `pathUtils.ts` 独立 `normalizePath` 与 `cd` 路径解析逻辑

#### 2. `backend/src/levels/validator.ts`（274 → 5~7 个文件）

现状问题：

- 规则定义和验证实现写在一起，新增关卡和新增验证类型都会继续撑大这个文件
- `switch` 已经覆盖大量规则分支，可读性和可维护性都在下降
- 补偿逻辑和基础 helper 与主流程耦合

建议拆分：

```text
backend/src/levels/validator.ts                     <= 100
backend/src/levels/types.ts                         <= 40
backend/src/levels/rules/index.ts                   <= 60
backend/src/levels/rules/chapter1.ts                <= 80
backend/src/levels/rules/chapter2.ts                <= 120
backend/src/levels/rules/chapter3.ts                <= 120
backend/src/levels/rules/chapter4.ts                <= 120
backend/src/levels/rules/chapter5.ts                <= 120
backend/src/levels/rules/chapter6.ts                <= 120
backend/src/levels/rules/chapter7.ts                <= 120
backend/src/levels/handlers/commandValidation.ts    <= 160
backend/src/levels/handlers/fileValidation.ts       <= 180
backend/src/levels/handlers/userValidation.ts       <= 160
backend/src/levels/handlers/outputValidation.ts     <= 140
backend/src/levels/helpers.ts                       <= 80
```

拆分原则：

- `validator.ts` 只保留调度入口：根据 `levelId` 取 rule，再分发给对应 handler
- 关卡规则按 chapter 拆开，新增关卡只改对应 chapter 文件
- `helpers.ts` 放 `stripAnsi` 之类的纯函数
- 用户已存在补偿逻辑保留在验证层，但从主流程抽到 `userValidation.ts` 或专门 helper
- 严格保持 `project.md` 里的边界：验证层负责规则，不把容器初始化命令放进验证文件

#### 3. `backend/src/db/index.ts`（203 → 4~6 个文件）

现状问题：

- 一个文件里混合了 DB 连接、schema 初始化、字段探测、错题迁移与错误分类
- `migrateWrongRecords()` 已经具备独立迁移模块的复杂度
- 后续再加迁移或表结构时，`index.ts` 会继续膨胀

建议拆分：

```text
backend/src/db/index.ts                             <= 40
backend/src/db/connection.ts                        <= 40
backend/src/db/schema.ts                            <= 80
backend/src/db/dbPath.ts                            <= 30
backend/src/db/wrongRecordClassifier.ts             <= 80
backend/src/db/migrations/migrateWrongRecords.ts    <= 180
backend/src/db/migrations/helpers.ts                <= 80
```

拆分原则：

- `index.ts` 只负责导出已初始化完成的 db 实例
- `connection.ts` 负责实例化 SQLite 和 pragma
- `schema.ts` 只负责基础建表
- `wrongRecordClassifier.ts` 抽离 `classifyWrongRecordType`
- `migrations/migrateWrongRecords.ts` 专门处理 wrong_records 的字段补齐、去重合并、索引重建
- `migrations/helpers.ts` 负责 `hasColumn()` 这类通用迁移工具

### 不在本次范围

- `backend/src/routes/auth.ts`（168 行）和 `backend/src/index.ts`（167 行）虽然接近阈值，但当前还未超过 200 行，本次先不动
- 不改 API 路由路径，不改 Socket 事件协议，不改数据库字段名

## Impact

- 当前 3 个超长后端文件会被拆成一组职责明确的子模块
- 后端目录会从“单大文件承载多个职责”转成“入口 + handler + config + helper + migration”结构
- 未来新增关卡、迁移、容器策略时，默认落在局部文件，不再回流到巨型入口文件
- 通过行数校验把“后端单文件不超过 200 行”从约定变成可执行规则
