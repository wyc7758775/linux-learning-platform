# refactor-extract-level-definitions

## Why

`App.tsx` 当前包含 60 个关卡定义（约 1577 行硬编码数据），导致文件膨胀至 2097 行。这带来以下问题：

1. **违反单一职责** — 组件逻辑与静态数据混杂，难以维护
2. **编辑风险高** — 修改关卡数据需要在核心组件文件中操作，容易误触逻辑代码
3. **构建体积大** — 关卡数据随组件一起打包，无法按需加载
4. **新增关卡流程繁琐** — 必须打开 App.tsx 找到插入位置，在 1500+ 行数据中定位

## What Changes

1. 将 `App.tsx` 中的 `LEVELS` 数组（第 15-1592 行）按章节拆分到独立文件
2. 在 `frontend/src/data/levels/` 目录下按章节组织关卡数据文件
3. 创建 `index.ts` 汇总导出所有关卡
4. `App.tsx` 仅保留 `import { LEVELS } from './data/levels'`

目录结构：

```
frontend/src/data/levels/
├── index.ts              # 汇总导出 LEVELS 数组
├── chapter1.ts           # 基础命令 (Level 1-5)
├── chapter2.ts           # 文件操作 (Level 6-15)
├── chapter3.ts           # 权限管理 (Level 16-25)
├── chapter4.ts           # 进程与服务 (Level 26-30)
├── chapter5.ts           # 自动化运维 (Level 31-40)
├── chapter6.ts           # Shell 脚本 (Level 41-50)
└── chapter7.ts           # 网络排查 (Level 51-60)
```

## Impact

- **App.tsx**: 从 ~2097 行减少到 ~500 行（仅组件逻辑）
- **新增 8 个文件**: 1 个汇总 + 7 个章节数据文件
- **零功能变更**: 纯数据搬移，不改任何逻辑
- **无后端影响**: 仅前端静态数据重构
- **无破坏性**: 对外接口不变，`LEVELS` 导出路径改变但使用方式不变
