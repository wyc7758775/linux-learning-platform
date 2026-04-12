## ADDED Requirements

### Requirement: 空闲超时自动销毁

系统 **SHALL** 记录每个容器 session 的最后活跃时间。每次执行命令时 **SHALL** 更新该时间。系统 **SHALL** 每 60 秒扫描一次所有 session，将超过 30 分钟无命令输入的容器销毁并标记 session 为 expired。系统 **SHALL** 在 session 变为 expired 后再保留最多 2 小时；若仍未重建，则 **SHALL** 从内存中删除该 session。

#### Scenario: 空闲超时销毁

- Given 用户创建了关卡 3 的容器 session
- And 用户 30 分钟内未执行任何命令
- When 空闲扫描定时器触发
- Then 容器被销毁，session 标记为 expired

#### Scenario: 活跃用户不受影响

- Given 用户每隔 10 分钟执行一次命令
- When 空闲扫描定时器触发
- Then session 保持活跃，容器不被销毁

#### Scenario: 过期 session 最终清理

- Given 某个 session 已因空闲超时被标记为 expired
- And 该 session 在 2 小时内未被重建
- When 空闲扫描定时器再次触发
- Then 该 session 从内存中删除

### Requirement: 超时后自动重建

系统 **SHALL** 在用户对已过期 session 执行命令时，自动用相同关卡 ID 重建容器（包括执行关卡 setup 命令）。重建后 **SHALL** 重置命令历史和工作目录至关卡初始状态。重建完成后 **SHALL** 通过 Socket.IO 发送 `session:expired` 事件通知前端。前端 **SHALL** 在终端显示提示"⚠ 会话已过期，环境已重新初始化"。重建后用户的命令 **SHALL** 正常执行并返回结果。系统 **SHALL** 串行化同一 session 的重建流程，避免并发命令重复创建多个容器。

#### Scenario: 过期后自动重建

- Given 用户的关卡 6 容器已因超时被销毁（session 标记为 expired）
- When 用户回来输入命令 `ls`
- Then 系统自动重建关卡 6 容器（包括 setup 命令）
- And 前端收到 `session:expired` 事件并显示提示
- And `ls` 命令在新容器中正常执行并返回结果

#### Scenario: 重建后状态重置

- Given 用户之前在关卡中创建了文件 /home/player/test.txt
- And 容器因超时被销毁并重建
- When 用户执行 `ls`
- Then 不再包含 test.txt（回到关卡初始状态）

#### Scenario: 并发命令共享同一次重建

- Given 某个 session 已标记为 expired
- When 用户连续快速发送两条命令
- Then 系统只创建一个新的容器
- And 第二条命令等待第一次重建完成后再执行

#### Scenario: 重建失败

- Given 某个 session 已标记为 expired
- And Docker daemon 异常导致无法创建新容器
- When 用户执行命令
- Then 本次命令返回重建失败错误
- And session 保持 expired 状态，允许后续重试

### Requirement: 并发容器数上限

系统 **SHALL** 限制活跃 session 对应的运行中容器数量不超过 20 个。创建容器或自动重建时若已达上限，**SHALL** 拒绝创建并返回错误信息。前端 **SHALL** 显示"当前资源不足，请稍后再试"。预热池中的空闲容器 **SHALL NOT** 计入并发上限。

#### Scenario: 达到并发上限

- Given 当前已有 20 个活跃容器 session
- When 新用户尝试创建关卡容器
- Then 创建失败，前端显示"当前资源不足，请稍后再试"

#### Scenario: 容器释放后可创建

- Given 当前有 20 个活跃容器，其中一个因超时被销毁
- When 新用户尝试创建关卡容器
- Then 创建成功

### Requirement: 容器预热池

系统 **SHALL** 在服务启动时预创建 3 个通用空容器（不执行关卡 setup）。创建关卡容器时 **SHALL** 优先从预热池取出容器，再执行关卡特定的 setup 命令。容器被取走后 **SHALL** 异步补充新容器到池中。系统 **SHALL** 在取用池中容器前校验其仍处于 running 状态；若已失效，则 **SHALL** 丢弃该容器并回退到现场创建。服务关闭时 **SHALL** 清理池中所有容器。

#### Scenario: 从预热池创建容器

- Given 预热池中有 3 个空容器
- When 用户进入关卡 7（需要 adduser -D alice）
- Then 从池中取出一个容器，执行 `adduser -D alice` setup 命令
- And 池中剩余 2 个容器，异步补充第 3 个

#### Scenario: 预热池为空时降级

- Given 预热池为空（所有容器已被取用且未补充完成）
- When 用户进入关卡
- Then 系统从零创建新容器（回退到当前行为）

#### Scenario: 服务关闭清理预热池

- Given 预热池中有 2 个空容器
- When 服务收到 SIGTERM 信号
- Then 池中容器全部被销毁

### Requirement: WebSocket 断开时的 session 清理

系统 **SHALL** 在 WebSocket 断开时销毁该 socket 持有的 session，并从内存中删除 session 记录；该规则同样适用于已经 expired 的 session。

#### Scenario: expired session 在断开连接后被删除

- Given 某个 session 已被标记为 expired
- And 用户的 WebSocket 连接随后断开
- When 服务处理 disconnect
- Then 该 session 从内存中删除
