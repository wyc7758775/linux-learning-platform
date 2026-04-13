# Tasks: 补全错题本功能

## 后端

- [x] DB Schema 迁移：wrong_records 新增 error_type、attempt_count 列 + 唯一索引
- [x] POST /api/wrong-records 改为 UPSERT（按 user_id+level_id+error_type 合并）
- [x] GET /api/wrong-records 返回 errorType、attemptCount
- [x] terminal:output 事件增加 completed 字段
- [x] seed 测试数据补充 error_type

## 前端

- [x] 新建 utils/classifyError.ts（错误分类函数 + 增强模板 + 探索命令过滤）
- [x] Terminal 组件：保存最近命令，增加 onCommandResult 回调
- [x] App.tsx：handleCommandResult 录入错题逻辑
- [x] services/api.ts：wrongRecordApi.create 增加 errorType 参数
- [x] WrongNotebook：记录卡片显示尝试次数 badge
- [x] WrongNotebook：ErrorAnalysis 使用 classifyError 增强模板（建议列表 + 相关命令）
