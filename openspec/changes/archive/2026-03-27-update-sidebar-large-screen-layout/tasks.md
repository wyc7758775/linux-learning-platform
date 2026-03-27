# Tasks: update-sidebar-large-screen-layout

- [x] 修改 `App.tsx` 侧边栏：aside 改为 `flex flex-col`（移除 `overflow-y-auto`），内部 div `flex-1 min-h-0 flex flex-col gap-6`
- [x] Progress 外层 wrapper 加 `flex-1 min-h-0`
- [x] 修改 `Progress.tsx` 根容器加 `h-full min-h-0 flex flex-col`，章节列表从 `max-h-[400px]` 改为 `flex-1 overflow-y-auto`
- [x] Level 保持自然高度布局
- [x] 验证：所有章节展开后 Level 卡片始终可见，滚动条仅在 Progress 章节区域内
