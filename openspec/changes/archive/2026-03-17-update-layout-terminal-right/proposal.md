# Proposal: update-layout-terminal-right

## Why

当前布局中 Terminal 位于 Level 组件下方，高度固定为 `h-80`（320px），导致：
1. Terminal 显示区域较小，无法充分利用屏幕空间
2. 用户需要频繁滚动才能同时看到关卡内容和终端输出
3. 长时间的终端输出会被截断，需要滚动查看

## What Changes

将布局调整为左右分栏结构：
- **左侧**：关卡导航（Progress）+ 关卡内容（Level）
- **右侧**：Terminal 固定定位，填充整个右侧高度

Terminal 使用 `position: sticky` 或 `height: calc(100vh - header高度)` 实现填充右侧高度但不撑高整个页面。

## Impact

### 受影响的文件
- `frontend/src/App.tsx` - 主布局调整
- `frontend/src/components/Terminal/Terminal.tsx` - 移除固定高度，支持自适应

### 向后兼容性
- ✅ 完全兼容，仅 UI 布局变更
- ✅ 无 API 变更
- ✅ 无数据模型变更

### 响应式设计
- 桌面端（lg+）：左右分栏布局
- 平板/移动端：保持原有上下堆叠布局
