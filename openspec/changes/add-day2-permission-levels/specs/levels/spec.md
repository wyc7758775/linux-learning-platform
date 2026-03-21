# Spec: Day 2 Permission Levels

## ADDED Requirements

### Requirement: Level 6 - 新同事入职

系统 **SHALL** 提供关卡 6"新同事入职"，用户通过 `adduser` 命令创建新用户 Alice，体验系统管理员的新员工入职场景。

#### Scenario: 创建用户 alice
- **Given**: 用户处于 Linux 终端环境
- **When**: 用户执行 `adduser alice` 或 `useradd alice`
- **Then**: 系统创建用户 alice，关卡完成

---

### Requirement: Level 7 - 部门分组

系统 **SHALL** 提供关卡 7"部门分组"，用户创建开发组并将 alice 加入该组，理解用户组的概念。

#### Scenario: 创建组并添加成员
- **Given**: 用户 alice 已存在
- **When**: 用户执行 `groupadd developers` 和 `usermod -aG developers alice`
- **Then**: 开发组存在且 alice 是其成员，关卡完成

---

### Requirement: Level 8 - 机密泄露

系统 **SHALL** 提供关卡 8"机密泄露"，用户发现工资文件权限过于开放，使用 chmod 修复安全问题。

#### Scenario: 修复敏感文件权限
- **Given**: `/home/player/salary.txt` 存在且权限过于开放（644）
- **When**: 用户执行 `chmod 600 /home/player/salary.txt`
- **Then**: 文件权限变为仅所有者可读写，关卡完成

---

### Requirement: Level 9 - 协作项目

系统 **SHALL** 提供关卡 9"协作项目"，用户设置共享项目目录的权限，让团队成员可以协作。

#### Scenario: 设置共享目录权限
- **Given**: developers 组已存在，`/home/player/project` 目录已存在
- **When**: 用户执行 `chown :developers /home/player/project` 和 `chmod 775 /home/player/project`
- **Then**: 目录属组为 developers，权限为 775，关卡完成

---

### Requirement: Level 10 - 脚本跑不起来

系统 **SHALL** 提供关卡 10"脚本跑不起来"，用户诊断并修复脚本的执行权限问题。

#### Scenario: 添加执行权限
- **Given**: `/home/player/deploy.sh` 存在但没有执行权限
- **When**: 用户执行 `chmod +x /home/player/deploy.sh` 或 `chmod 755 /home/player/deploy.sh`
- **Then**: 脚本拥有执行权限，关卡完成

---

### Requirement: Level 11 - 权限解密

系统 **SHALL** 提供关卡 11"权限解密"，用户根据数字权限创建对应权限的文件，验证对数字权限的理解。

#### Scenario: 理解数字权限
- **Given**: 用户需要展示对权限数字的理解
- **When**: 用户创建一个权限为 750 的文件
- **Then**: 存在一个权限为 750 的文件，关卡完成

---

### Requirement: Level 12 - 最终挑战

系统 **SHALL** 提供关卡 12"最终挑战"，用户综合运用权限知识完成复杂任务。

#### Scenario: 综合权限挑战
- **Given**: developers 组已存在
- **When**: 用户创建 `/home/player/shared` 目录，属组设为 developers，权限设为 764
- **Then**: shared 目录存在，属组为 developers，权限为 764，关卡完成

---

## MODIFIED Requirements

### Requirement: 扩展前端关卡定义

系统 **MUST** 修改 `frontend/src/App.tsx` 中的 LEVELS 数组，添加 Level 6-12 的定义。

#### Scenario: 显示新关卡
- **Given**: 用户查看关卡列表
- **When**: 应用加载
- **Then**: 显示 Chapter 2: 权限实战的 7 个新关卡

---

### Requirement: 扩展后端验证规则

系统 **MUST** 修改 `backend/src/levels/validator.ts` 中的 LEVEL_VALIDATIONS，添加 Level 6-12 的验证逻辑。

#### Scenario: 验证新关卡
- **Given**: 用户在新关卡中执行命令
- **When**: 命令执行完成
- **Then**: 根据关卡要求验证命令/文件/权限是否正确
