# Levels Spec Delta

## ADDED Requirements

### Requirement: 第 5 章 DevOps 实战关卡

系统 SHALL 提供第 5 章"DevOps 实战"，包含 10 个关卡（ID 31-40），覆盖环境变量、Shell 脚本、定时任务、SSH 配置、文件同步、进程守护、监控告警和 CI 流水线等 DevOps 核心技能。

#### Scenario: 环境变量泄漏（Level 31）
- Given 用户进入 Level 31
- When 用户使用 `export` 设置环境变量 `DB_PASSWORD=mysecret123`
- Then 验证环境变量已设置，关卡通过

#### Scenario: 编写启动脚本（Level 32）
- Given 用户进入 Level 32
- When 用户创建 `start.sh` 脚本并赋予执行权限，脚本内容包含 `echo "Server started"`
- Then 验证脚本存在且可执行，关卡通过

#### Scenario: 传递参数（Level 33）
- Given 用户进入 Level 33
- When 用户创建 `deploy.sh` 脚本，接受参数 `dev`/`staging`/`prod`，执行 `bash deploy.sh prod`
- Then 验证脚本输出包含 "prod" 环境标识，关卡通过

#### Scenario: 定时备份（Level 34）
- Given 用户进入 Level 34
- When 用户配置 crontab 添加一条每天凌晨 2 点执行的备份任务
- Then 验证 crontab 中存在对应条目，关卡通过

#### Scenario: 日志轮转（Level 35）
- Given 用户进入 Level 35
- When 用户编写 logrotate 配置文件，对 `/var/log/app.log` 设置按天轮转保留 7 天
- Then 验证配置文件存在且内容正确，关卡通过

#### Scenario: SSH 免密登录（Level 36）
- Given 用户进入 Level 36
- When 用户使用 `ssh-keygen` 生成密钥并将公钥写入 authorized_keys
- Then 验证密钥文件和 authorized_keys 存在，关卡通过

#### Scenario: 同步文件（Level 37）
- Given 用户进入 Level 37
- When 用户使用 `rsync` 将本地 dist 目录同步到备份目录
- Then 验证目标目录中文件已同步，关卡通过

#### Scenario: 进程守护（Level 38）
- Given 用户进入 Level 38
- When 用户编写 systemd service 文件并启动服务
- Then 验证服务状态为 running，关卡通过

#### Scenario: 磁盘监控告警（Level 39）
- Given 用户进入 Level 39
- When 用户编写监控脚本 `monitor.sh`，当磁盘使用率超过阈值时输出告警
- Then 验证脚本存在且可执行，关卡通过

#### Scenario: CI 流水线（Level 40）
- Given 用户进入 Level 40
- When 用户编写 `ci.sh` 脚本，依次执行依赖安装、测试、构建，用 `&&` 链式执行
- Then 验证脚本按顺序执行所有步骤，关卡通过
