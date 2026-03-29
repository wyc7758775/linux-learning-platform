# Spec: auth

## ADDED Requirements

### Requirement: 用户注册

系统 **SHALL** 提供用户注册功能，用户通过用户名和密码创建账号。用户名 **SHALL** 支持 2-20 字符的中文、英文、数字和下划线，且全局唯一不区分大小写。密码 **SHALL** 为 8-64 字符，**MUST** 包含至少一个大写字母和一个特殊符号。注册成功后系统 **SHALL** 自动签发 JWT Token 并返回用户信息。

#### Scenario: 使用中文用户名注册成功

- Given 用户名 "学习者小明" 和密码 "Pass#word123" 均符合规则
- When 提交注册请求
- Then 返回 201，包含 token 和用户信息

#### Scenario: 密码缺少大写字母

- Given 用户名 "testuser" 和密码 "pass#word123"（无大写字母）
- When 提交注册请求
- Then 返回 400，提示"密码必须包含至少一个大写字母"

#### Scenario: 密码缺少特殊符号

- Given 用户名 "testuser" 和密码 "Password123"（无特殊符号）
- When 提交注册请求
- Then 返回 400，提示"密码必须包含至少一个特殊符号"

#### Scenario: 用户名已存在

- Given 用户名 "learner" 已被注册
- When 使用 "learner" 再次注册
- Then 返回 409，提示"用户名已存在"

---

### Requirement: 用户登录

系统 **SHALL** 提供用户登录功能，验证用户名和密码后签发 JWT Token（有效期 3 天）。连续输错密码 5 次后，系统 **SHALL** 要求完成 CAPTCHA 验证才能继续登录。登录成功后系统 **SHALL** 重置失败计数。

#### Scenario: 正常登录成功

- Given 用户 "学习者小明" 已注册，密码正确
- When 提交登录请求
- Then 返回 200，包含 token 和用户信息，login_fail_count 重置为 0

#### Scenario: 密码错误（未达 CAPTCHA 阈值）

- Given 用户 "学习者小明" 已注册，当前失败次数为 2
- When 提交错误密码
- Then 返回 401，login_fail_count 更新为 3，返回剩余尝试次数

#### Scenario: 密码错误达到 5 次触发 CAPTCHA

- Given 用户 "学习者小明" 已注册，当前失败次数为 4
- When 提交错误密码
- Then 返回 401，login_fail_count 更新为 5，返回 needCaptcha: true

#### Scenario: CAPTCHA 验证后登录

- Given 用户失败次数 >= 5，已获取 CAPTCHA 并正确输入
- When 提交登录请求（含 captchaId + captchaCode + 正确密码）
- Then 返回 200，login_fail_count 重置为 0

---

### Requirement: CAPTCHA 验证码

当用户登录失败次数达到阈值时，系统 **SHALL** 生成 SVG 图片验证码。验证码 **SHALL** 一次有效且验证后销毁，有效期 **SHALL** 为 5 分钟。

#### Scenario: 获取 CAPTCHA

- When 调用 GET /api/auth/captcha
- Then 返回 captchaId 和 SVG 图片数据

#### Scenario: CAPTCHA 过期

- Given 已获取 CAPTCHA 超过 5 分钟
- When 使用该 captchaId 登录
- Then 返回 400，提示"验证码已过期"

---

### Requirement: Token 无感刷新

系统 **SHALL** 为 JWT Token（有效期 3 天）提供无感刷新机制。认证中间件 **SHALL** 检测 Token 剩余有效期，当有效期 < 1 天时，**SHALL** 在成功响应的 `X-New-Token` 头中返回新 Token。前端 **SHALL** 自动读取响应头并更新本地存储。系统 **SHALL** 提供 `POST /api/auth/refresh` 端点用于主动刷新。

#### Scenario: Token 有效期内正常使用

- Given Token 剩余有效期 > 1 天
- When 用户发起请求
- Then 正常处理，响应头不包含 X-New-Token

#### Scenario: Token 即将过期自动续期

- Given Token 剩余有效期 < 1 天且 > 0
- When 用户发起请求
- Then 正常处理，响应头包含 X-New-Token，新 Token 有效期重新为 3 天

#### Scenario: Token 已过期

- Given Token 已过期
- When 用户发起请求
- Then 返回 401，前端重定向到登录页

---

### Requirement: 用户头像

每个用户 **SHALL** 拥有头像字段，默认使用 emoji 表情作为头像。注册时系统 **SHALL** 随机分配一个 emoji 默认头像。用户 **SHALL** 可从内置 emoji 列表中选择更换。头像字段 **SHALL** 存储 emoji Unicode 字符（如 "🦊"），不下载图片素材，emoji 列表 **SHALL** 与系统内置表情保持同步。

#### Scenario: 新用户获得随机 emoji 头像

- When 用户注册成功
- Then 用户 avatar 字段为一个随机 emoji 字符

#### Scenario: 用户更换头像

- Given 用户已登录
- When 用户从 emoji 面板选择 "🦊"
- Then 头像更新为 "🦊"，保存到数据库

#### Scenario: 用户信息展示头像

- Given 用户头像为 "🦊"
- When 获取用户 profile
- Then 返回 avatar: "🦊"，前端直接渲染 emoji
