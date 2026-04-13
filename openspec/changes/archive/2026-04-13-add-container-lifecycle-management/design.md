# Design: 容器生命周期管理

## 架构决策

### 1. 超时后 session 处理策略：标记 expired vs 直接删除

**决策**：标记为 expired，不立即删除 session 记录。

**理由**：
- 直接删除后 `executeCommand` 会抛 "Session not found"，前端无法区分"不存在"和"已过期"
- 保留 expired session 允许自动重建：检测到 expired → 用 `levelId` 重建 → 替换 containerId → 恢复为活跃
- 重建完成后前端收到 `session:expired` 事件，可以显示友好提示而非报错

### 2. 预热池粒度：通用空容器 vs 按关卡预热

**决策**：预热通用空容器（不执行任何 level setup）。

**理由**：
- 60+ 关卡不可能全部预热，按关卡预热命中率低
- 容器创建本身是耗时操作（1-2 秒），setup 命令通常很快（<0.5 秒）
- 通用容器从池中取出后再执行 setup，总时间 ≈ 0.5 秒 vs 原来 1.5-2 秒

### 3. 预热池容量

**决策**：固定 3 个。

**理由**：
- 单用户场景通常同时只用 1 个容器，3 个足够覆盖快速切换关卡
- 额外内存占用 384MB（3 × 128MB），对一般机器可接受
- 池中容器不计入 MAX_CONTAINERS 上限

### 4. 并发上限语义

**决策**：`MAX_CONTAINERS` 表示活跃 session 数，不是 Docker 容器总数。

**理由**：
- 预热池是性能优化，不直接对应用户会话
- 因此运行中的 Docker 容器总数上限为 `MAX_CONTAINERS + poolSize`
- 需要在文档中显式说明，避免把池容器误算入业务并发

### 5. 预热池实现位置

**决策**：ContainerManager 内部实现，不新建独立类。

**理由**：
- 预热池和容器管理紧密耦合（共享 Docker 实例、镜像检查逻辑）
- 单用户场景复杂度不高，内聚在一个类里更简单
- 新增 `pool: Docker.Container[]` 数组 + `warmPool()` / `acquireContainer()` / 异步补池方法

### 6. 预热池容器保活与健康校验

**决策**：依赖镜像默认 `/bin/bash` + `Tty/OpenStdin` 保持容器运行，同时在入池和取用时显式校验 `State.Running`。

**理由**：
- 当前镜像默认命令是 `/bin/bash`，配合交互式容器配置会保持 running
- 但实现不能只依赖隐式行为；若容器异常退出，取用前必须丢弃失效容器
- 因此需要在 `createBaseContainer()` 和 `acquireContainer()` 中显式 `inspect()`
- 若异步补池失败，只记录日志并在短暂延迟后重试，不阻塞正常建会话流程

### 7. expired session 的最终清理

**决策**：保留 expired session 2 小时用于自动重建，超时后直接从 Map 删除。

**理由**：
- 满足“用户短暂离开后回来自动恢复”的体验
- 避免永不返回的用户让 expired session 永久占用内存
- 2 小时窗口足够覆盖中断后返回场景

### 8. 重建竞态处理

**决策**：同一 session 只允许一个重建流程进行，其余命令等待该流程完成。

**理由**：
- 避免连续回车导致重复创建多个新容器
- 第一个触发重建的命令负责发出 `session:expired` 提示；后续等待中的命令不重复提示
- 实现上使用 `rebuilding` 状态和单个 in-flight rebuild promise 即可

### 9. 超时重建时的 Socket.IO 事件通知

**决策**：重建由 `executeCommand` 内部触发，通过返回值标识，由 `index.ts` 的 socket handler 发送事件。

**理由**：
- ContainerManager 不应持有 socket 引用（职责分离）
- `executeCommand` 返回值新增 `reconnected: boolean` 字段
- `index.ts` 中 `terminal:input` handler 检测到 `reconnected === true` 时 emit `session:expired`

### 10. 前端提示形式

**决策**：在终端内输出 ANSI 提示，不额外弹 Toast。

**理由**：
- 会话恢复是终端上下文内事件，提示应跟随命令流显示
- 避免全局 Toast 打断学习界面
- `terminal:output` 返回的 `currentDir` 会在同一轮更新前端目录状态，无需额外重置

### 11. 数据流

```
用户输入命令
  → terminal:input handler
    → containerManager.executeCommand(sessionId, command)
      → 检查 session.expired?
        → 是：调用 rebuildContainer(session) → 重新 createContainer + setup → 标记 reconnected
        → 否：正常执行
    → 返回 { output, currentDir, reconnected }
  → if reconnected: socket.emit('session:expired')
  → socket.emit('terminal:output', { output, currentDir })
```

```
空闲扫描定时器（每 60 秒）
  → 遍历 sessions
    → Date.now() - lastActiveAt > 30 分钟?
      → 是：销毁容器，标记 session.expired = true
    → session.expiredAt 超过 2 小时?
      → 是：删除 session
```

```
服务启动
  → containerManager.warmPool(3)  // 预创建 3 个空容器
  → containerManager.startIdleCheck()  // 启动超时扫描
```

### 12. 边界场景

- WebSocket 断开时，无论 session 是否 expired，都会走 `destroyContainer(sessionId)` 删除 session 记录
- 自动重建失败时，本次命令返回错误；session 保持 expired，后续用户再次输入命令时可重试重建

### 13. 文件变更清单

| 文件 | 变更类型 |
|------|----------|
| `backend/src/docker/containerManager.ts` | 修改：新增 lastActiveAt、expired 字段；空闲扫描；自动重建；预热池 |
| `backend/src/index.ts` | 修改：启动时调用 warmPool/startIdleCheck；handler 检测 reconnected 发送事件；关闭时清理 |
| `backend/src/socket/handlers.ts` | 修改：handleTerminalInput 返回值新增 reconnected 字段 |
| `frontend/src/components/Terminal/Terminal.tsx` | 修改：监听 session:expired 事件，显示提示 |
