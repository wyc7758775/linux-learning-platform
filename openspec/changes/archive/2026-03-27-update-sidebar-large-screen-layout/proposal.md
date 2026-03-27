# Proposal: update-sidebar-large-screen-layout

## Why

在宽高较大的桌面屏幕上，左侧边栏垂直堆叠了 **Progress**（关卡选择网格）和 **Level**（关卡详情卡片）两个组件。Level 卡片内容量有限，导致 Progress 和 Level 之间的比例不协调——Progress 没有充分利用空间，Level 区域底部空白。

## What Changes

1. **Progress 弹性填充**：给 Progress 组件外层包裹 `flex-1`，让它弹性占据剩余空间，网格自动撑大
2. **Level 自然高度**：Level 组件只由子元素撑高，不拉伸，紧贴内容

## Impact

- **影响文件**：`App.tsx`（侧边栏容器布局）
- **无功能变更**：纯 CSS/布局调整，不影响业务逻辑
- **向后兼容**：移动端布局不变，滚动行为不变
