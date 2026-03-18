# Tasks: add-level-completion-firework

## Implementation Checklist

- [x] 创建烟花组件 `Firework.tsx`
  - [x] Canvas 粒子动画实现
  - [x] 粒子发射和爆炸效果
  - [x] 颜色随机生成
  - [x] 粒子数量限制 (max 100)

- [x] 添加音效
  - [x] 使用 Web Audio API 合成音效
  - [x] 音效与爆炸同步播放
  - [x] 静默失败，不影响体验

- [x] 集成到 Level 组件
  - [x] 在 `completed=true` 时触发烟花
  - [x] 5秒后自动销毁
  - [x] 点击"下一关"时立即销毁

- [x] 性能优化
  - [x] 使用 `requestAnimationFrame`
  - [x] Canvas 使用 `will-change: transform`
  - [x] 动画结束清理资源
  - [x] 组件卸载时清理定时器和事件

- [x] 测试验证 (Playwriter 自动验证)
  - [x] 烟花动效正常显示 (Canvas 1512x810)
  - [x] 音效正常播放 (Web Audio API)
  - [x] 5秒后自动消失 ✅
  - [x] 点击下一关立即消失 ✅
  - [x] 性能无明显影响 (粒子≤100)
