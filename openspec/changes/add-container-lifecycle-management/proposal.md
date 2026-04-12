# Proposal: 容器生命周期管理

## Why

当前每个关卡创建独立的 Docker 容器，但缺乏生命周期管理机制：

1. **无空闲超时**：用户离开页面后容器永远存活（除非 WebSocket 正常断开或服务器重启），网络异常导致的僵尸容器会持续占用资源
2. **无并发上限**：异常情况（多标签页、僵尸连接、NAS 多用户）可能导致容器数量失控，耗尽宿主机内存/CPU
3. **容器创建延迟**：每次进入关卡都需要从零创建容器 + 执行 setup 命令，用户体验有明显等待

## What Changes

### 1. 空闲超时自动销毁 + 自动重建

**后端 — ContainerManager：**
- 记录每个 session 的最后活跃时间（`lastActiveAt`）
- 每次 `executeCommand` 时更新 `lastActiveAt`
- 启动定时器（每 60 秒扫描一次），销毁超过 30 分钟无操作的容器
- 容器被超时销毁后，session 从 Map 中标记为 `expired`（而非直接删除）
- `expired` session 若 2 小时内仍未重建，则从内存中清理，避免长期滞留

**后端 — 自动重建：**
- `executeCommand` 检测到 session 已过期时，自动用相同 `levelId` 重建容器
- 重建后更新 session 的 `containerId`，清空 `commandHistory`，重置 `currentDir`
- 重建过程串行化；同一 session 同时到达的多条命令共享同一次重建，避免重复创建容器

**前端 — 用户提示：**
- 后端重建完成后通过 Socket.IO 发送 `session:expired` 事件
- 前端收到后在终端内输出 ANSI 提示："⚠ 会话已过期，环境已重新初始化"
- 终端恢复正常使用，用户无需手动操作

### 2. 并发容器数上限

**后端 — ContainerManager：**
- 新增 `MAX_CONTAINERS` 常量（固定 20，表示活跃 session 数）
- `createContainer` / 自动重建时先检查当前活跃 session 数量
- 超出上限时抛出错误，前端提示"当前资源不足，请稍后再试"

### 3. 容器预热池

**后端 — ContainerManager 内部预热池：**
- 维护一个预创建容器的队列（无 setup 的通用容器）
- 服务启动时预热若干空容器（如 3 个）
- `createContainer` 时优先从池中取出一个，然后执行关卡的 setup 命令
- 容器被取走后异步补充新容器到池中
- 池中容器不计入并发上限
- 取用池中容器前显式校验其仍处于 running 状态，失效则丢弃并回退到现场创建

**效果：** 省去容器创建时间（约 1-2 秒），只需执行 setup 命令（通常 <0.5 秒）。

## Impact

- **文件变更范围**：主要修改 `backend/src/docker/containerManager.ts`，新增预热池逻辑
- **前端变更**：`frontend/src/components/Terminal/` 相关组件监听 `session:expired` 事件
- **向后兼容**：对用户完全透明，现有功能不受影响
- **资源消耗**：预热池会额外占用 3 × 128MB ≈ 384MB 内存，需确保宿主机有足够余量
