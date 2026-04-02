import type { Level } from "./types";

// Chapter 2: 权限实战 (Level 6-12)
export const chapter2Levels: Level[] = [
  {
    id: 6,
    chapter: 2,
    title: "新同事入职",
    description: "公司来了新同事 Alice！作为系统管理员，帮她创建账户吧",
    hint: "使用 adduser 命令创建用户 alice",
    command: "adduser alice",
    validation: { type: "user_exists", expected: "alice" },
    completed: false,
  },
  {
    id: 7,
    chapter: 2,
    title: "部门分组",
    description: "Alice 是开发部的！创建 developers 组，然后把她加进去",
    hint: "先用 groupadd 创建组，再用 usermod -aG 添加用户到组",
    command: "groupadd developers && usermod -aG developers alice",
    validation: { type: "user_in_group", expected: "alice:developers" },
    completed: false,
  },
  {
    id: 8,
    chapter: 2,
    title: "机密泄露！",
    description: "糟糕！salary.txt 这个工资文件谁都能看！赶紧修复这个安全问题",
    hint: "chmod 600 可以让文件只有所有者能读写",
    command: "chmod 600 /home/player/salary.txt",
    validation: {
      type: "file_permission",
      expected: "/home/player/salary.txt:600",
    },
    completed: false,
  },
  {
    id: 9,
    chapter: 2,
    title: "协作项目",
    description:
      "设置 project 目录，让 developers 组的成员都能读写，其他人只能看",
    hint: "chown :developers 改变属组，chmod 775 设置权限",
    command:
      "chown :developers /home/player/project && chmod 775 /home/player/project",
    validation: {
      type: "directory_permission",
      expected: "/home/player/project:775:developers",
    },
    completed: false,
  },
  {
    id: 10,
    chapter: 2,
    title: "脚本跑不起来",
    description: 'deploy.sh 运行时报 "Permission denied"？修复它！',
    hint: "chmod +x 可以给脚本添加执行权限",
    command: "chmod +x /home/player/deploy.sh",
    validation: {
      type: "file_permission",
      expected: "/home/player/deploy.sh:755",
    },
    completed: false,
  },
  {
    id: 11,
    chapter: 2,
    title: "权限解密",
    description: "创建一个权限为 750 的文件！750 = rwxr-x---，你理解了吗？",
    hint: "touch 创建文件，chmod 750 设置权限",
    command: "touch test.txt && chmod 750 test.txt",
    validation: { type: "permission_exists", expected: "750" },
    completed: false,
  },
  {
    id: 12,
    chapter: 2,
    title: "最终挑战",
    description:
      "创建 shared 目录：你完全控制，developers 组可读写，其他人只能看",
    hint: "mkdir 创建目录，chown 改变属组，chmod 764 设置权限",
    command:
      "mkdir /home/player/shared && chown :developers /home/player/shared && chmod 764 /home/player/shared",
    validation: {
      type: "directory_permission",
      expected: "/home/player/shared:764:developers",
    },
    completed: false,
  },
];
