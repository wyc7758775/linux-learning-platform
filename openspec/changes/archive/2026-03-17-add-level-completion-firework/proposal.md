# Proposal: add-level-completion-firework

## Why

当前关卡完成时只有简单的文字提示"恭喜! 你已完成这个关卡"，缺乏视觉反馈和成就感。添加烟花动效和音效可以：
1. 增强用户完成关卡的成就感
2. 提供更丰富的视觉反馈
3. 提升学习体验的趣味性

## What Changes

1. **烟花动效组件** - 在关卡完成时屏幕中央显示烟花爆炸动画
2. **音效播放** - 配合烟花动效播放庆祝音效
3. **自动销毁** - 5秒后自动消失，或点击"下一关"按钮时立即销毁
4. **性能优化** - 使用 CSS 动画或轻量级 canvas，确保不影响主线程

### 技术方案

**方案选择：Canvas + requestAnimationFrame**
- 使用轻量级 Canvas 绘制粒子烟花
- 音效使用 Web Audio API 或 HTML5 Audio
- 粒子数量限制在 100 以内，避免性能问题
- 使用 `will-change` 和 `transform` 优化动画性能

**备选方案：CSS 动画**
- 纯 CSS 实现简单烟花效果
- 性能更好，但视觉效果较弱

## Impact

### 受影响的文件
- `frontend/src/components/Level/Level.tsx` - 添加完成状态处理
- `frontend/src/components/Firework/Firework.tsx` - 新增烟花组件
- `frontend/src/assets/sounds/firework.mp3` - 音效文件

### 性能考虑
- 粒子数量限制：max 100 particles
- 动画帧率：60fps target
- 内存管理：动画结束后清理 Canvas
- 音效预加载：避免播放延迟

### 向后兼容性
- ✅ 纯前端变更，无 API 影响
- ✅ 可通过设置关闭音效（未来扩展）
