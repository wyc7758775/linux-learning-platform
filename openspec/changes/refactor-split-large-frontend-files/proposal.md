# Proposal: 拆分超长前端界面文件到 200 行以内

## Why

当前前端界面层有 6 个文件超过 200 行：

1. `frontend/src/components/WrongNotebook/WrongNotebook.tsx` — 865 行
2. `frontend/src/App.tsx` — 589 行
3. `frontend/src/components/Level/Level.tsx` — 357 行
4. `frontend/src/components/Firework/Firework.tsx` — 262 行
5. `frontend/src/components/Terminal/Terminal.tsx` — 261 行
6. `frontend/src/components/Progress/Progress.tsx` — 246 行

这些文件普遍同时承载了状态管理、派生数据、事件副作用、配置常量和 JSX 视图，已经明显超出单文件可维护范围。继续叠加需求会带来三个直接问题：

1. **改动风险高**：一个需求经常需要触碰同一大文件里的多个职责区块
2. **复用和测试困难**：逻辑和视图耦合，难以单测，也难以局部复用
3. **代码审查成本高**：单文件上下文太长，review 难以快速定位真实变更

## What Changes

### 全局约束

1. 本次重构目标不是改视觉和业务，而是**纯拆分职责**
2. 所有新增或重写的 `tsx/ts` 文件都以 **200 行为硬上限**
3. 超过 200 行的内容必须继续按以下维度拆开：
   - 容器组件 vs 展示组件
   - hook 副作用 vs 纯渲染
   - constants/config vs 业务逻辑
   - desktop/mobile 视图
   - list/detail/header/footer 子区块
4. 增加一个前端行数校验脚本，例如 `frontend/scripts/check-max-lines.mjs`，并通过 `npm run lint:lines` 固化规则，避免回弹

### 文件级拆分提案

#### 1. `frontend/src/App.tsx`（589 → 7~9 个文件）

现状问题：

- 同时处理登录进度同步、socket 生命周期、错题本计数、终端放大态、header 和两个主视图
- 多个 `useEffect` 与长 JSX 结构混在一起，已经不适合作为根组件继续扩展

建议拆分：

```text
frontend/src/App.tsx                                   <= 40
frontend/src/features/app/AppShell.tsx                 <= 140
frontend/src/features/app/components/AppHeader.tsx     <= 160
frontend/src/features/app/components/LearnWorkspace.tsx <= 170
frontend/src/features/app/components/NotebookWorkspace.tsx <= 80
frontend/src/features/app/components/DesktopTerminalPanel.tsx <= 180
frontend/src/features/app/components/MobileTerminalNotice.tsx <= 60
frontend/src/features/app/hooks/useProgressSync.ts     <= 180
frontend/src/features/app/hooks/useSessionLifecycle.ts <= 180
frontend/src/features/app/hooks/useWrongRecordCount.ts <= 80
```

拆分原则：

- `App.tsx` 只负责挂载 `AppShell`
- 进度加载/保存逻辑移到 `useProgressSync`
- socket 连接、`session:create`、`level:completed`、命令失败录入移到 `useSessionLifecycle`
- header、学习区、错题本区、桌面终端面板各自成为独立组件
- 移动端终端提示单独拆出，不再占用主容器篇幅

#### 2. `frontend/src/components/WrongNotebook/WrongNotebook.tsx`（865 → 10~12 个文件）

现状问题：

- 文件内部混合了类型定义、时间格式化、章节配置、错误类型样式、数据请求、列表布局、详情面板、错误分析
- 一个组件里同时承载“数据层 + 布局层 + 列表项 + 详情页 + 分析卡”

建议拆分：

```text
frontend/src/components/WrongNotebook/WrongNotebook.tsx <= 120
frontend/src/components/WrongNotebook/types.ts          <= 80
frontend/src/components/WrongNotebook/constants.ts      <= 140
frontend/src/components/WrongNotebook/utils.ts          <= 120
frontend/src/components/WrongNotebook/hooks/useWrongNotebookData.ts <= 140
frontend/src/components/WrongNotebook/components/NotebookLoadingState.tsx <= 60
frontend/src/components/WrongNotebook/components/NotebookEmptyState.tsx <= 80
frontend/src/components/WrongNotebook/components/NotebookListPane.tsx <= 180
frontend/src/components/WrongNotebook/components/NotebookStatsBar.tsx <= 120
frontend/src/components/WrongNotebook/components/NotebookGroupSection.tsx <= 180
frontend/src/components/WrongNotebook/components/NotebookRecordRow.tsx <= 140
frontend/src/components/WrongNotebook/components/NotebookDetailPanel.tsx <= 190
frontend/src/components/WrongNotebook/components/ErrorAnalysisCard.tsx <= 150
```

拆分原则：

- `types.ts` 放 `WrongRecord`、`WrongRecordDetail`、`GroupedRecords`
- `constants.ts` 只保留 `chapterNames`、`chapterColors`、`errorTypeStyles`
- `utils.ts` 放 `formatTime`、`formatFullTime`、分组和统计函数
- `useWrongNotebookData` 统一处理 `fetch / archive / selectedRecord / mobileShowDetail`
- 左侧列表、右侧详情、错误分析完全拆开
- 若 `NotebookDetailPanel.tsx` 接近 200 行，再继续拆成 `DetailHeader / DetailSections / DetailFooter`

#### 3. `frontend/src/components/Level/Level.tsx`（357 → 6~8 个文件）

现状问题：

- 同时管理烟花触发、知识点折叠、目标区、提示区、通关区、复盘区
- 多个内容块都是天然可拆的 UI section，但现在全部塞在一个文件里

建议拆分：

```text
frontend/src/components/Level/Level.tsx                <= 100
frontend/src/components/Level/constants.ts             <= 40
frontend/src/components/Level/hooks/useLevelCelebration.ts <= 80
frontend/src/components/Level/components/LevelHeader.tsx <= 90
frontend/src/components/Level/components/LevelKnowledgeSection.tsx <= 180
frontend/src/components/Level/components/LevelObjectiveBlock.tsx <= 100
frontend/src/components/Level/components/LevelHintBlock.tsx <= 90
frontend/src/components/Level/components/LevelCompletionPrompt.tsx <= 130
frontend/src/components/Level/components/LevelReviewSection.tsx <= 120
```

拆分原则：

- `Level.tsx` 只保留组合逻辑和各 section 的装配
- 通关烟花的副作用抽成 `useLevelCelebration`
- “相关知识点”“任务目标”“提示”“通关后复盘”各自独立
- 移动端底部通关卡和桌面通关卡共用一个 `LevelCompletionPrompt`

#### 4. `frontend/src/components/Firework/Firework.tsx`（262 → 5~6 个文件）

现状问题：

- 画布动画、粒子创建、音频合成、资源清理都堆在一个组件里
- 这类文件最怕继续堆特效，一旦再加配置就会进一步失控

建议拆分：

```text
frontend/src/components/Firework/Firework.tsx          <= 70
frontend/src/components/Firework/types.ts              <= 30
frontend/src/components/Firework/constants.ts          <= 40
frontend/src/components/Firework/utils/createParticle.ts <= 60
frontend/src/components/Firework/hooks/useFireworkCanvas.ts <= 180
frontend/src/components/Firework/hooks/useFireworkAudio.ts <= 170
```

拆分原则：

- 组件本身只保留 `canvas` 节点和 hook 调用
- 粒子生成与常量配置拆离
- 音频生命周期单独管理，不再挤在动画循环文件里

#### 5. `frontend/src/components/Terminal/Terminal.tsx`（261 → 5~6 个文件）

现状问题：

- xterm 初始化、主题配置、输入处理、socket 输出监听、目录同步、session 重置都在同一层
- 后续再加命令历史、快捷键、复制粘贴支持时会继续爆炸

建议拆分：

```text
frontend/src/components/Terminal/Terminal.tsx          <= 90
frontend/src/components/Terminal/terminalPrompt.ts     <= 40
frontend/src/components/Terminal/terminalTheme.ts      <= 90
frontend/src/components/Terminal/hooks/useTerminalInstance.ts <= 180
frontend/src/components/Terminal/hooks/useTerminalInput.ts <= 150
frontend/src/components/Terminal/hooks/useTerminalSocketEvents.ts <= 150
```

拆分原则：

- `terminalTheme.ts` 只放亮暗主题配置
- `useTerminalInstance` 负责实例创建、fit、ResizeObserver、welcome message
- `useTerminalInput` 负责 buffer、回车、退格、输入回显
- `useTerminalSocketEvents` 负责 `terminal:output / session:error / session:expired`

#### 6. `frontend/src/components/Progress/Progress.tsx`（246 → 4~6 个文件）

现状问题：

- 章节配置、展开收起状态、顶部进度条、章节卡、关卡格子都在同一个文件
- 当前文件已经接近“再加一个需求就需要通盘重读”的临界点

建议拆分：

```text
frontend/src/components/Progress/Progress.tsx          <= 90
frontend/src/components/Progress/progress.config.ts    <= 90
frontend/src/components/Progress/hooks/useExpandedChapters.ts <= 80
frontend/src/components/Progress/components/ProgressHeader.tsx <= 80
frontend/src/components/Progress/components/ChapterAccordion.tsx <= 180
frontend/src/components/Progress/components/LevelGrid.tsx <= 140
```

拆分原则：

- 顶部总进度和章节列表分离
- 章节折叠逻辑抽成 `useExpandedChapters`
- `chapterConfig` 从组件文件移到 `progress.config.ts`
- 如果 `ChapterAccordion.tsx` 超预算，再把章节头和章节体继续分成两个文件

## Impact

- 目标是把 6 个超长文件拆成约 30 个以内的明确职责文件
- 不改现有功能，不改数据结构，不改接口契约
- 前端目录会从“按大组件堆叠”转成“容器 + hooks + 子组件 + constants”结构
- 之后新增需求默认落在局部文件，不再回流到单个巨型组件
- 通过行数校验脚本把“单文件不超过 200 行”从约定变成可执行规则
