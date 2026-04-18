# Tasks: 拆分超长后端文件到 200 行以内

- [x] 新增后端行数守卫脚本，例如 `backend/scripts/check-max-lines.mjs`
- [x] 在 `backend/package.json` 增加 `lint:lines`，校验重构范围内 `ts` 文件不超过 200 行
- [x] 拆分 `backend/src/docker/containerManager.ts`，提取 types、constants、levelSetup、commandPolicy、containerFactory、sessionLifecycle、fileChecks、pathUtils
- [x] 拆分 `backend/src/levels/validator.ts`，提取 chapter rules、handlers、helpers、types
- [x] 拆分 `backend/src/db/index.ts`，提取 connection、schema、wrongRecordClassifier、migration helpers、migrateWrongRecords
- [x] 验证容器会话创建、命令执行、超时处理、session 过期重建行为无回归
- [x] 验证关卡校验逻辑无回归，尤其是 Chapter 2 用户/权限类关卡和 adduser 补偿逻辑
- [x] 验证数据库初始化和 wrong_records 迁移逻辑无回归
- [x] 运行后端构建和行数守卫，确认所有重构范围内文件都不超过 200 行
