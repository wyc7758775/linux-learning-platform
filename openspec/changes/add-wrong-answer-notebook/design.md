# Design: 错题本功能

## 架构决策

### 1. Tab 导航 vs 路由导航

**决策**：使用 Header Tab 切换（state），不新增路由。

**理由**：

- 错题本与学习界面共享同一 header 状态（连接状态、用户信息、主题）
- 避免重复加载 WebSocket 连接和终端
- 用户体验更流畅，无需页面刷新

**实现**：App.tsx 新增 `activeTab: 'learn' | 'notebook'` state，根据值渲染不同主内容区。

### 2. 错题记录时机

**决策**：仅在前端触发「检查」操作且验证失败时记录。

**理由**：

- 不是每条命令都验证（用户可能在探索）
- 只有明确尝试通关失败时才记录，减少噪音

**实现**：前端监听验证失败事件，调用 `POST /api/wrong-records` 写入。

### 3. AI 扩展实现

**决策**：后端调用 LLM API，前端只做展示。

**理由**：

- API Key 不暴露到前端
- 可缓存 AI 生成结果，避免重复调用
- 后续可换模型无需前端改动

**接口设计**：

```
POST /api/wrong-records/:id/expand
Response: { knowledge: string } // Markdown 格式的知识点
```

**Prompt 策略**：将关卡标题、描述、用户执行的命令、期望结果组合成 prompt，要求 LLM 生成：

1. 错误原因分析
2. 正确做法说明
3. 相关知识点扩展

### 4. detail 字段结构

```typescript
interface WrongRecordDetail {
  command: string; // 用户执行的命令
  output: string; // 命令输出（截断至 500 字符）
  expectedHint: string; // 关卡的提示信息
}
```

### 5. 数据流

```
用户执行命令 → 验证失败 → 前端 POST /api/wrong-records → 写入 DB
                                                        ↓
用户点击「AI 解析」→ POST /api/wrong-records/:id/expand → 调用 LLM → 返回知识点
```

### 6. 文件变更清单

| 文件                                     | 变更类型                        |
| ---------------------------------------- | ------------------------------- |
| `frontend/src/App.tsx`                   | 修改：添加 Tab 导航和错题本视图 |
| `frontend/src/components/WrongNotebook/` | 新增：错题本组件                |
| `frontend/src/services/api.ts`           | 修改：添加错题 API 调用         |
| `backend/src/index.ts`                   | 修改：添加错题 API 路由         |
| `backend/src/db/index.ts`                | 无需修改（表已存在）            |
