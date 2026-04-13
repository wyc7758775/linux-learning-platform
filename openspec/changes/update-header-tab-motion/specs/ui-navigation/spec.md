# Delta Spec: ui-navigation

## MODIFIED Requirements

### Requirement: Header 主导航展示

系统 SHALL 在 header 左侧展示 `学习` 和 `错题本` 两个主切换标签。原有标题文案 `Linux 命令行学习平台` SHALL 被移除。

#### Scenario: Header 不再显示标题文案

- Given: 用户打开应用
- When: header 渲染完成
- Then: header 中不显示 `Linux 命令行学习平台` 文字
- And: `学习` / `错题本` 标签位于 header 左侧区域

### Requirement: Tab 激活态切换反馈

系统 SHALL 在 `学习` / `错题本` 两个标签之间提供局部激活态动画。激活标签的背景块 MUST 在两个标签之间横向滑动，作为主要切换反馈。

#### Scenario: 从学习切换到错题本

- Given: 当前激活标签为 `学习`
- When: 用户点击 `错题本`
- Then: 激活背景块从 `学习` 标签横向滑动到 `错题本` 标签
- And: 不触发新的整页级切换动画

#### Scenario: 从错题本切换到学习

- Given: 当前激活标签为 `错题本`
- When: 用户点击 `学习`
- Then: 激活背景块从 `错题本` 标签横向滑动到 `学习` 标签
- And: 标签文本保持可读

### Requirement: Tab 对齐方式

系统 SHALL 将 `学习` / `错题本` 标签组左对齐展示，而不是保持近似居中。

#### Scenario: 标签组左对齐

- Given: 用户查看桌面端 header
- When: header 渲染
- Then: `学习` / `错题本` 标签组位于 header 左侧
- And: 右侧状态区仍保持独立展示
