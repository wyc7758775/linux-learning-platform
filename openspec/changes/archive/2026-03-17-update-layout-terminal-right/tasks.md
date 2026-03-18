# Tasks: update-layout-terminal-right

## Implementation Checklist

- [x] 修改 `App.tsx` 布局结构
  - [x] 将 grid 布局改为左右分栏
  - [x] 左侧：Progress + Level 垂直堆叠
  - [x] 右侧：Terminal 容器使用 sticky 定位

- [x] 修改 `Terminal.tsx` 高度逻辑
  - [x] 移除固定 `h-80` 高度
  - [x] 使用 `flex-1` 或 `h-full` 填充父容器
  - [x] 确保 FitAddon 在 resize 时正确触发

- [x] 添加响应式支持
  - [x] 桌面端（lg+）：Terminal sticky 定位在右侧
  - [x] 移动端：Terminal 保持正常流式布局

- [x] 测试验证 (Playwriter 自动验证)
  - [x] 桌面端 Terminal 填充右侧高度 (690px 容器, 652px 内部)
  - [x] 滚动左侧内容时 Terminal 保持固定 (sticky top: 24px)
  - [x] Terminal 不撑高整个页面 (height: calc(100vh - 120px))
  - [x] 移动端布局正常 (flex-col, 无 sticky)
