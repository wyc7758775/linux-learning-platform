# Tasks: 容器生命周期管理

## 空闲超时

- [ ] ContainerSession 接口新增 `lastActiveAt: Date` 和 `expired: boolean` 字段
- [ ] `executeCommand` 中更新 `lastActiveAt`
- [ ] 新增 `startIdleCheck()` 方法：每 60 秒扫描，销毁超过 30 分钟无活跃的容器
- [ ] 过期 session 标记为 expired 而非直接删除
- [ ] `expired` session 超过 2 小时未重建时，从内存中清理
- [ ] `executeCommand` 检测到 expired session 时自动重建容器（相同 levelId）
- [ ] 增加重建锁，同一 session 并发命令只触发一次重建
- [ ] 重建后通过 Socket.IO 发送 `session:expired` 事件通知前端
- [ ] 前端监听 `session:expired`，在终端显示提示信息
- [ ] 服务启动时调用 `startIdleCheck()`，关闭时清理定时器

## 并发上限

- [ ] 新增 `MAX_CONTAINERS = 20` 常量
- [ ] `createContainer` 开头检查活跃 session 数量 >= `MAX_CONTAINERS`
- [ ] 在 design/spec 中明确 `MAX_CONTAINERS` 表示活跃 session 数，不含预热池
- [ ] 超限时抛出明确错误，前端展示"当前资源不足，请稍后再试"

## 容器预热池

- [ ] 在 `ContainerManager` 内部实现预热池，不新建独立 `ContainerPool` 类
- [ ] `warmPool()` 方法：预创建指定数量的空容器（无 setup）
- [ ] `acquireContainer()` 方法：从池中取出容器，若池空则现场创建
- [ ] 取用池容器前显式校验其仍在 running，失效则丢弃
- [ ] `createContainer` 改为先 acquire 再执行 setup 命令
- [ ] 容器被取走后异步补充（`replenish()`）
- [ ] 异步补池失败时记录日志并延迟重试，不阻塞建会话流程
- [ ] 服务启动时调用 `warmPool()`
- [ ] 服务关闭时清理池中容器

## 测试

- [ ] 单元测试：空闲超时扫描逻辑
- [ ] 单元测试：expired session 超时清理
- [ ] 单元测试：并发上限拒绝
- [ ] 单元测试：预热池取用与补充
- [ ] 单元测试：并发命令仅触发一次重建
- [ ] E2E 测试：超时后自动重建流程
