# Delta Spec: wrong-records

## ADDED Requirements

### Requirement: 验证失败自动记录错题

当已登录用户在终端执行非探索性命令且关卡验证失败时，系统 MUST 自动将该次失败记录写入 wrong_records 表。探索性命令（ls、cat、pwd、cd 等纯浏览命令）不触发记录。

#### Scenario: 登录用户执行错误命令

- Given: 用户已登录，正在进行关卡挑战
- When: 用户执行非探索性命令（如 chmod、adduser）且验证未通过
- Then: 系统将 { command, output, hint, errorType } 写入 wrong_records 表

#### Scenario: 探索性命令不记录

- Given: 用户已登录，正在进行关卡挑战
- When: 用户执行探索性命令（如 ls、cat、pwd）且验证未通过
- Then: 不写入 wrong_records 表

#### Scenario: 游客用户不记录

- Given: 用户未登录（游客模式）
- When: 用户执行命令且验证未通过
- Then: 不写入 wrong_records 表

#### Scenario: 已完成关卡不记录

- Given: 用户在一个已完成的关卡中练习
- When: 用户执行命令且验证未通过
- Then: 不写入 wrong_records 表

### Requirement: 同类错误按类型合并

系统 MUST 按 (user_id, level_id, error_type) 唯一键合并错题记录。重复的同类错误更新 detail 为最新内容、attempt_count 递增、刷新 created_at。

#### Scenario: 首次犯错

- Given: 用户在某关卡无该类型的错题记录
- When: 产生一条 error_type 为 "permission" 的错题
- Then: 创建新记录，attempt_count = 1

#### Scenario: 重复犯同类错误

- Given: 用户在某关卡已有 error_type 为 "permission" 的记录（attempt_count = 2）
- When: 再次产生 "permission" 类型的错题
- Then: 更新该记录 detail 为最新命令和输出，attempt_count 变为 3，刷新 created_at

#### Scenario: 不同类型错误独立记录

- Given: 用户在某关卡已有 "permission" 类型的错题
- When: 产生 "notfound" 类型的错题
- Then: 创建新记录，两条记录独立存在

### Requirement: 增强错误分析模板

系统 MUST 为每种错误类型提供详细的分析模板，包含描述、可操作建议列表和相关命令。错误类型共 6 种：permission、notfound、syntax、command、empty、logic。

#### Scenario: 查看权限错误分析

- Given: 用户打开一条 error_type 为 "permission" 的错题详情
- When: 渲染错误分析区域
- Then: 显示"权限不足"标签、详细描述、4-5 条建议（如"使用 sudo"、"检查文件权限"）和相关命令列表

#### Scenario: 查看逻辑错误分析

- Given: 用户打开一条 error_type 为 "logic" 的错题详情
- When: 渲染错误分析区域
- Then: 显示"逻辑错误"标签、详细描述、建议（如"对比输出和期望"）和相关命令列表

### Requirement: 错题卡片显示尝试次数

当错题记录的 attempt_count 大于 1 时，系统 MUST 在错题卡片上显示尝试次数标记。

#### Scenario: 多次尝试的错题

- Given: 一条错题记录 attempt_count = 5
- When: 在错题列表中展示该记录
- Then: 卡片上显示 "5次" 的 badge

#### Scenario: 首次错误无 badge

- Given: 一条错题记录 attempt_count = 1
- When: 在错题列表中展示该记录
- Then: 不显示尝试次数 badge

## MODIFIED Requirements

### Requirement: terminal:output 事件增加验证结果

后端 terminal:output socket 事件 MUST 包含 completed 字段，指示当前命令是否通过关卡验证。

#### Scenario: 命令验证通过

- Given: 用户执行命令且关卡验证通过
- When: 后端发送 terminal:output 事件
- Then: 事件数据包含 completed: true

#### Scenario: 命令验证未通过

- Given: 用户执行命令且关卡验证未通过
- When: 后端发送 terminal:output 事件
- Then: 事件数据包含 completed: false
