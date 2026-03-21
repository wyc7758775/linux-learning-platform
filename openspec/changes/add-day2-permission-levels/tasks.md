# Tasks: Add Day 2 Permission Levels

## 前端关卡定义

- [x] 在 `frontend/src/App.tsx` 中添加 Level 6: 新同事入职
- [x] 在 `frontend/src/App.tsx` 中添加 Level 7: 部门分组
- [x] 在 `frontend/src/App.tsx` 中添加 Level 8: 机密泄露
- [x] 在 `frontend/src/App.tsx` 中添加 Level 9: 协作项目
- [x] 在 `frontend/src/App.tsx` 中添加 Level 10: 脚本跑不起来
- [x] 在 `frontend/src/App.tsx` 中添加 Level 11: 权限解密
- [x] 在 `frontend/src/App.tsx` 中添加 Level 12: 最终挑战

## 后端验证规则

- [x] 在 `backend/src/levels/validator.ts` 中添加 Level 6 验证（检查 adduser/useradd 命令）
- [x] 在 `backend/src/levels/validator.ts` 中添加 Level 7 验证（检查 groupadd + usermod）
- [x] 在 `backend/src/levels/validator.ts` 中添加 Level 8 验证（检查文件权限为 600）
- [x] 在 `backend/src/levels/validator.ts` 中添加 Level 9 验证（检查目录属组和权限 775）
- [x] 在 `backend/src/levels/validator.ts` 中添加 Level 10 验证（检查脚本执行权限）
- [x] 在 `backend/src/levels/validator.ts` 中添加 Level 11 验证（检查存在 750 权限的文件）
- [x] 在 `backend/src/levels/validator.ts` 中添加 Level 12 验证（检查 shared 目录权限 764）

## Docker 环境准备

- [x] 确保 Docker 容器支持 adduser/groupadd 命令（安装 sudo）
- [x] 为 Level 8 预创建 `/home/player/salary.txt` 文件
- [x] 为 Level 9 预创建 `/home/player/project` 目录
- [x] 为 Level 10 预创建 `deploy.sh` 脚本（无执行权限）

## Playwriter 自动验证

- [x] 验证第2章标题显示为"权限实战"
- [x] 验证 Level 6-12 按钮正确显示
- [x] 验证 Level 6 内容（标题、描述、目标命令）
- [x] 验证关卡锁定逻辑正常工作

## 测试验证

- [x] 后端代码编译通过
- [x] 前端代码编译通过
- [x] Docker 镜像构建成功
