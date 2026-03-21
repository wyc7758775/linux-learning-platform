# Tasks: Add Day 3 Incident Response Levels

## 一、数据结构与类型

- [ ] 在 `frontend/src/levels.ts`（或 types 文件）中扩展 `Level` 接口，新增 `objective?: string` 和 `knowledgeCards?: KnowledgeCard[]` 字段
- [ ] 定义 `KnowledgeCard` 接口（command, description, flags?）

## 二、前端 UI 组件

- [ ] 修改 `Level.tsx`：当有 `knowledgeCards` 时渲染知识卡片区域（可折叠，默认展开）
- [ ] 修改 `Level.tsx`：当有 `objective` 时展示"任务目标"，无 `objective` 时展示原有"目标命令"
- [ ] 知识卡片折叠状态保存到 localStorage

## 三、前端关卡数据

- [ ] 在 `App.tsx` 的 LEVELS 数组中添加 Level 13-20，填写 `objective`、`knowledgeCards`、`hint`、`validation`

## 四、后端验证逻辑

- [ ] 在 `backend/src/levels/validator.ts` 中新增验证类型：`output_number`、`output_lines_gte`、`output_matches`
- [ ] 添加 Level 13-20 的验证配置（参见 design.md 中各关卡验证策略）

## 五、Docker 容器数据预埋

- [ ] 编写脚本生成 `access.log`（~5000 行，植入 `10.66.6.6` 攻击 IP、02:17 时段、47 条 500 错误、23 条时段 500 错误）
- [ ] 编写脚本生成 `app.log`（包含 312 条 ERROR 记录）
- [ ] 在 Dockerfile 中配置启动 `stress-worker` 占用 CPU 进程
- [ ] 在 Dockerfile 中配置 `nc` 监听 8080 端口
- [ ] 在 Dockerfile 中将 `/var/log/nginx` 设为最大日志目录

## 六、验证

- [ ] 手动测试 Level 13-20 每关可正常通过
- [ ] 验证 Chapter 1/2 关卡展示无变化（向后兼容）
- [ ] 验证知识卡片在有/无数据时的正确渲染
