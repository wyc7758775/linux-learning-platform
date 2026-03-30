## ADDED Requirements

### Requirement: 第 6 章脚本编程关卡

系统 **SHALL** 提供第 6 章"脚本编程"，包含 Level 41-50 共 10 个关卡，教授 Shell 脚本编程的核心能力。每个关卡 **SHALL** 包含 title、description、hint、command、objective、knowledgeCards 和 validation 字段。

关卡主题 **SHALL** 按以下顺序递进：

1. **第一个脚本**（Level 41）：创建并执行简单 bash 脚本
2. **变量与替换**（Level 42）：变量赋值、引用、字符串拼接
3. **读取输入**（Level 43）：`read` 命令交互式输入
4. **条件判断**（Level 44）：`if/elif/else` 条件分支
5. **退出码与逻辑**（Level 45）：`$?`、`exit`、`&&`、`||`
6. **循环遍历**（Level 46）：`for...in`、C 风格 for 循环
7. **循环读取**（Level 47）：`while read` 逐行处理
8. **函数封装**（Level 48）：函数定义、参数传递、返回值
9. **字符串处理**（Level 49）：参数扩展、cut、awk 文本处理
10. **综合实战**（Level 50）：编写服务器健康检查脚本

#### Scenario: 第 6 章关卡正确渲染

- Given 用户完成 Level 40
- When 查看关卡列表
- Then 第 6 章"脚本编程"可见，包含 10 个关卡（Level 41-50），Level 41 为可解锁状态

#### Scenario: 完成脚本关卡

- Given 用户在 Level 41
- When 按要求创建并执行脚本，输出符合验证条件
- Then 关卡标记为已完成，解锁 Level 42

### Requirement: 脚本关卡验证支持

系统 **SHALL** 支持对 Shell 脚本关卡的验证，包括但不限于：
- 脚本文件是否存在且可执行
- 脚本执行输出是否包含预期内容
- 脚本文件内容是否包含关键语法（如 `#!/bin/bash`、`if`、`for` 等）

验证器 **SHALL** 复用已有的 `output_contains`、`file_exists`、`file_content_contains` 等验证类型，必要时可扩展新类型。

#### Scenario: 验证脚本输出

- Given 用户执行 `bash /home/player/report.sh`
- When 脚本输出包含 "System Report"
- Then Level 41 验证通过

#### Scenario: 验证脚本文件内容

- Given 用户创建了 `/home/player/healthcheck.sh`
- When 文件内容包含 `#!/bin/bash` 且包含 `for` 关键字
- Then 验证通过
