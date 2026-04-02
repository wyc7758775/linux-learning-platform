# Tasks: 错题本功能

## 后端

- [ ] 定义 WrongRecordDetail 类型（command, output, expectedHint）
- [ ] 新增 POST /api/wrong-records — 写入错题记录
- [ ] 新增 GET /api/wrong-records — 获取当前用户错题列表（按 level_id 分组）
- [ ] 新增 DELETE /api/wrong-records/:id — 删除单条错题
- [ ] 插入测试数据（覆盖多个关卡）

## 前端

- [ ] App.tsx header 添加「学习」/「错题本」Tab 导航
- [ ] App.tsx 添加 activeTab state，条件渲染主内容
- [ ] 创建 WrongNotebook 组件：按关卡分组的错题列表
- [ ] 错题卡片：展开/折叠详情（命令、输出、提示）
- [ ] 删除错题功能
- [ ] services/api.ts 添加错题相关 API 调用

## 集成

- [ ] 前端验证失败时自动记录错题
- [ ] 错题本空状态提示
- [ ] 错题数量 badge 显示在 Tab 上

## 后续迭代（AI 扩展）

- [ ] POST /api/wrong-records/:id/expand — 调用 LLM 扩展知识点
- [ ] 「AI 解析」按钮 + 加载态 + 知识点展示
- [ ] LLM 结果缓存
