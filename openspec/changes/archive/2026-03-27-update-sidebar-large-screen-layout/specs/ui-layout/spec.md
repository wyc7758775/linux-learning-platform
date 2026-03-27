# UI Layout Spec Delta

## MODIFIED Requirements

### Requirement: 左侧边栏垂直空间分配

左侧边栏 SHALL 使用弹性布局（flex column），Level 组件 MUST 自动填充 Progress 组件之后的剩余高度，消除大屏幕下的底部空白。

#### Scenario: 大屏幕下左侧边栏无底部空白
- Given 用户使用桌面浏览器，屏幕高度 ≥ 900px
- When 页面渲染左侧边栏（Progress + Level 组件）
- Then Level 组件自动填充 Progress 之后的剩余空间
- And 提示词区域和完成按钮位于 Level 卡片底部
- And 左下方不出现大面积空白

### Requirement: Level 组件内部弹性布局

Level 组件 MUST 使用 flex column 布局，中间内容区（描述、知识点、目标）SHALL 自动撑开，提示词和完成按钮保持在卡片底部。

#### Scenario: Level 卡片内容自然分布
- Given 用户进入某个关卡
- When Level 组件渲染（标题、描述、知识点、目标、提示词、完成状态）
- Then 标题区域在卡片顶部
- And 中间内容区自动撑开填充空间
- And 提示词按钮和完成按钮保持在卡片底部
- And 内容在卡片内垂直均匀分布

## ADDED Requirements

### Requirement: 侧边栏容器弹性布局

侧边栏内部容器 SHALL 支持 flex column 弹性排列，使子组件自动分配垂直空间。

#### Scenario: 侧边栏子组件弹性排列
- Given 页面渲染左侧边栏
- When 侧边栏包含 Progress 和 Level 两个子组件
- Then Progress 组件保持自身高度不变
- And Level 组件获得剩余的全部垂直空间
