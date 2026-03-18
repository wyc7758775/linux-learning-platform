# Design: add-level-completion-firework

## 技术架构

### 1. 组件结构

```
Level.tsx
└── Firework.tsx (条件渲染)
    ├── Canvas (粒子动画)
    └── Audio (音效播放)
```

### 2. 粒子系统设计

```typescript
interface Particle {
  x: number
  y: number
  vx: number      // 速度 x
  vy: number      // 速度 y
  color: string
  alpha: number   // 透明度
  size: number
  life: number    // 生命周期
}
```

### 3. 动画流程

```
完成关卡 → 触发烟花 → 发射粒子 → 重力下落 → 淡出消失
    ↓
播放音效
    ↓
5秒后 / 点击下一关 → 销毁组件
```

### 4. 性能优化策略

| 策略 | 说明 |
|------|------|
| 粒子数量限制 | 最多 100 个粒子，超出后复用 |
| requestAnimationFrame | 与浏览器刷新同步，避免丢帧 |
| will-change: transform | GPU 加速 |
| 离屏检测 | 粒子超出屏幕立即移除 |
| 资源清理 | 组件卸载时清理 Canvas 和 Audio |

### 5. 音效方案

**选择：Web Audio API**
- 比 `<audio>` 元素延迟更低
- 支持音量控制和预加载
- 可以同时播放多个音效

```typescript
const playSound = async () => {
  const audioContext = new AudioContext()
  const response = await fetch('/sounds/firework.mp3')
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

  const source = audioContext.createBufferSource()
  source.buffer = audioBuffer
  source.connect(audioContext.destination)
  source.start()
}
```

### 6. 备选：CSS 动画方案

如果 Canvas 性能不佳，可退化为 CSS 动画：

```css
.firework {
  position: fixed;
  top: 50%;
  left: 50%;
  animation: firework-burst 1s ease-out forwards;
}

@keyframes firework-burst {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(3); opacity: 0; }
}
```

## 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 低端设备卡顿 | 中 | 粒子数量动态调整 |
| 音效播放失败 | 低 | 静默失败，不影响动画 |
| Canvas 内存泄漏 | 中 | 组件卸载时清理 |
