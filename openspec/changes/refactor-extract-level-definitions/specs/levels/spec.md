## MODIFIED Requirements

### Requirement: 关卡数据组织

关卡定义 MUST 按章节拆分到独立文件中，存放在 `frontend/src/data/levels/` 目录下。每个章节文件 MUST 导出一个 `ChapterXLevelData` 类型数组（X 为章节编号）。`index.ts` MUST 汇总所有章节数据并导出统一的 `LEVELS` 数组，保证顺序与拆分前完全一致。

#### Scenario: 关卡数据按章节独立维护

- Given 开发者需要修改第 3 章的关卡数据
- When 编辑 `frontend/src/data/levels/chapter3.ts`
- Then 只需修改该文件，不影响其他章节或 App.tsx

#### Scenario: 新增章节只需添加新文件

- Given 开发者需要添加第 8 章关卡
- When 创建 `chapter8.ts` 并在 `index.ts` 中导入
- Then 新章节自动加入关卡列表，无需修改 App.tsx

#### Scenario: 关卡数据导入方式不变

- Given App.tsx 需要使用关卡数据
- When `import { LEVELS } from './data/levels'`
- Then 获得与重构前完全相同的 LEVELS 数组
