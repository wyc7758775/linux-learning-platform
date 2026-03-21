# Design: Day 3 Incident Response Levels

## 1. Level 数据结构变更

### 新增字段

```typescript
interface KnowledgeCard {
  command: string           // 命令名，如 "ps aux"
  description: string       // 一句话作用描述
  flags?: {
    flag: string            // 如 "--sort=-%cpu"
    meaning: string         // 如 "按 CPU 使用率降序排列"
  }[]
}

interface Level {
  // 现有字段（保留）
  id: number
  chapter: number
  title: string
  description: string       // 场景背景故事
  hint: string
  command: string           // 保留，Chapter 1/2 兼容用
  validation: Validation
  completed: boolean

  // 新增字段
  objective?: string        // 任务目标描述（结果导向），Chapter 3 使用
  knowledgeCards?: KnowledgeCard[]  // 本关知识卡片
}
```

### 向后兼容策略

- `objective` 为可选字段；未提供时 Level 组件回退显示 `command`
- `knowledgeCards` 为可选字段；未提供时不显示知识卡片区域
- Chapter 1/2 所有关卡无需改动

---

## 2. 验证逻辑扩展

Chapter 3 关卡不验证命令本身（管道写法多样），只验证**输出结果**。

### 新增验证类型

```typescript
// 已有
{ type: 'command', expected: string }
{ type: 'output_contains', expected: string }

// 新增
{ type: 'output_number', expected: number, tolerance?: number }
// 验证输出中包含指定数字（允许 ±tolerance 偏差）

{ type: 'output_matches', pattern: string }
// 验证输出匹配正则表达式

{ type: 'output_lines_gte', expected: number }
// 验证输出行数 ≥ expected（用于列表类输出）
```

### 各关卡验证策略

| Level | 验证类型 | 验证内容 |
|-------|---------|---------|
| 13 | `output_contains` | 输出包含目标进程名（预埋进程名已知） |
| 14 | `output_contains` | 输出包含最大目录路径 |
| 15 | `output_contains` | 输出包含占用 8080 端口的进程名 |
| 16 | `output_lines_gte` | 输出行数 ≥ 预设的 500 错误行数 |
| 17 | `output_number` | 输出数字等于预埋的 ERROR 数量 |
| 18 | `output_contains` | 输出包含预埋的攻击 IP 且排在第一 |
| 19 | `output_number` | 输出数字等于预埋的时段 500 错误数 |
| 20 | `output_contains` | 输出包含预埋的攻击 IP 和对应请求数 |

---

## 3. 容器数据预埋设计

### 3.1 nginx access.log（~5000 行）

格式：Combined Log Format
```
IP - - [日期:时间 +0800] "METHOD /path HTTP/1.1" STATUS SIZE "referer" "UA"
```

**植入规律**（验证锚点）：

| 植入内容 | 具体值 | 用途 |
|---------|--------|------|
| 攻击 IP | `10.66.6.6` | Level 18/20 追凶目标，请求量远超其他 IP |
| 告警时段 | `02:17` | Level 19/20 时间过滤范围 |
| 500 错误数 | 47 条（已知） | Level 16/17 统计验证基准 |
| 告警时段 500 数 | 23 条 | Level 19 验证基准 |
| 告警时段攻击IP 请求数 | 182 次 | Level 20 验证基准 |

### 3.2 app.log

格式：`[时间戳] LEVEL message`
预埋 ERROR 行数：固定值（例如 312 条），作为 Level 17 的答案。

### 3.3 模拟进程

Dockerfile 中启动一个占用 CPU 的后台脚本（`yes > /dev/null &`），
进程名设为 `stress-worker`，作为 Level 13 的寻找目标。

### 3.4 端口占用

启动一个监听 8080 端口的简单服务（`nc -l 8080 &`），
进程名为 `nc`，作为 Level 15 的目标。

---

## 4. UI 组件设计

### Level 组件布局变更

```
┌─────────────────────────────────┐
│ [章节] · [关卡号]                │
│ [标题]              [已完成标签] │
├─────────────────────────────────┤
│ [场景描述 description]           │  ← 保留
├─────────────────────────────────┤
│ 📚 本关知识  ▼（默认展开）        │  ← 新增，有 knowledgeCards 时显示
│  ┌──────────────────────────┐   │
│  │ ps aux  查看所有进程状态   │   │
│  │   -a  所有用户的进程       │   │
│  │   -u  显示 CPU/内存信息   │   │
│  │ |（管道）将前一个命令的    │   │
│  │   输出传给下一个命令       │   │
│  └──────────────────────────┘   │
├─────────────────────────────────┤
│ 🎯 任务目标                      │  ← objective 存在时替换 command 展示
│ "找出当前 CPU 占用最高的进程名"   │
│ 或                               │
│ 目标命令: [command]              │  ← 无 objective 时（Chapter 1/2）
├─────────────────────────────────┤
│ [提示按钮]                       │
└─────────────────────────────────┘
```

### 知识卡片交互

- 默认展开，可折叠（用户熟悉后可折叠节省空间）
- 命令名加粗高亮（绿色等终端风格）
- flags 列表缩进展示，flag 黄色，meaning 灰色
