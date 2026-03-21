# Spec: Level Knowledge Card UI

## ADDED Requirements

### Requirement: Level 类型扩展 - knowledgeCards 字段

系统 **SHALL** 在 `frontend/src/levels.ts`（或类型定义文件）中扩展 `Level` 接口，新增 `knowledgeCards` 和 `objective` 可选字段。

#### Scenario: 类型定义生效
- **Given**: 开发者为 Chapter 3 关卡定义 `knowledgeCards`
- **When**: TypeScript 编译
- **Then**: 编译通过，无类型错误

---

### Requirement: 知识卡片展示区域

系统 **SHALL** 在 `Level` 组件中，当关卡数据包含 `knowledgeCards` 字段时，展示知识卡片区域。

展示规则：
- 默认展开状态
- 可点击折叠/展开（记忆状态到 localStorage）
- 每张卡片展示：命令名（绿色高亮）+ 描述；若有 `flags`，缩进列出每个 flag（黄色）及其含义（灰色）

#### Scenario: 展示单命令知识卡片
- **Given**: 关卡定义 `knowledgeCards: [{ command: "ps aux", description: "查看所有进程状态", flags: [{flag: "-a", meaning: "所有用户的进程"}] }]`
- **When**: 用户查看该关卡
- **Then**: 界面显示 `ps aux` 和 "查看所有进程状态"，以及 `-a` 和 "所有用户的进程"

#### Scenario: 无知识卡片时不显示区域
- **Given**: 关卡数据不包含 `knowledgeCards` 字段（Chapter 1/2 关卡）
- **When**: 用户查看该关卡
- **Then**: 知识卡片区域不渲染，界面与原来完全一致

---

### Requirement: 任务目标替换目标命令展示

系统 **SHALL** 在 `Level` 组件中，当关卡数据包含 `objective` 字段时，以"任务目标"形式展示，替代"目标命令"展示。

#### Scenario: 有 objective 时展示任务目标
- **Given**: 关卡定义 `objective: "找出当前 CPU 占用最高的进程名"`
- **When**: 用户查看该关卡
- **Then**: 界面显示 "🎯 任务目标" 标签和目标描述文字，不展示完整命令

#### Scenario: 无 objective 时退回展示 command（向后兼容）
- **Given**: 关卡数据只有 `command` 字段（Chapter 1/2 关卡）
- **When**: 用户查看该关卡
- **Then**: 界面显示 "目标命令" 和 `command` 值，与原来一致
