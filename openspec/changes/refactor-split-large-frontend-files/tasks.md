# Tasks: 拆分超长前端界面文件到 200 行以内

- [ ] 新增前端行数守卫脚本，例如 `frontend/scripts/check-max-lines.mjs`
- [ ] 在 `frontend/package.json` 增加 `lint:lines`，校验重构范围内 `ts/tsx` 文件不超过 200 行
- [ ] 拆分 `frontend/src/App.tsx`，提取 header、learn/notebook workspace、desktop terminal panel、progress/session hooks
- [ ] 拆分 `frontend/src/components/WrongNotebook/WrongNotebook.tsx`，提取 types、constants、utils、data hook、list pane、detail pane、analysis card
- [ ] 拆分 `frontend/src/components/Level/Level.tsx`，提取 celebration hook、header、knowledge section、objective block、hint block、completion prompt、review section
- [ ] 拆分 `frontend/src/components/Firework/Firework.tsx`，提取 particle/types/constants、canvas hook、audio hook
- [ ] 拆分 `frontend/src/components/Terminal/Terminal.tsx`，提取 prompt、theme、terminal instance hook、input hook、socket events hook
- [ ] 拆分 `frontend/src/components/Progress/Progress.tsx`，提取 config、expanded state hook、progress header、chapter accordion、level grid
- [ ] 重构完成后执行 `frontend` 构建与 lint，确认功能无回归
- [ ] 运行行数守卫，确认所有新增和修改后的前端文件都不超过 200 行
