import type { Level } from "./types";

// Chapter 2: 权限实战 (Level 6-12)
export const chapter2Levels: Level[] = [
  {
    id: 6,
    chapter: 2,
    title: "新同事入职",
    description: "公司来了新同事 Alice！先创建她的账户，再查看刚创建的用户信息",
    objective: "先执行 adduser alice 创建用户，再执行 id alice 查看用户信息",
    hint: "这关需要两步：先 adduser alice，再 id alice；只创建用户还不算完成",
    command: "id alice",
    knowledgeCards: [
      {
        command: "adduser alice",
        description: "创建新用户 alice",
      },
      {
        command: "id alice",
        description: "查看 alice 的 UID、GID 和所属组",
      },
    ],
    validation: { type: "user_exists", expected: "alice" },
    completed: false,
  },
  {
    id: 7,
    chapter: 2,
    title: "部门分组",
    description: "Alice 是开发部的！先把她加入 developers 组，再查看她当前的组信息",
    objective: "先执行 usermod -aG developers alice，再执行 id alice 或 groups alice 查看用户组",
    hint: "这关也需要两步：先 usermod -aG developers alice，再用 id alice 查看结果",
    command: "id alice",
    knowledgeCards: [
      {
        command: "usermod -aG developers alice",
        description: "把 alice 追加到 developers 组，保留她原有的其他组",
        flags: [
          { flag: "-a", meaning: "追加到附加组，不能单独使用，通常和 -G 一起用" },
          { flag: "-G", meaning: "指定附加组列表" },
        ],
      },
      {
        command: "id alice",
        description: "查看 alice 的 UID、GID 以及当前所属的全部组",
      },
    ],
    completionKnowledgeCards: [
      {
        command: "usermod -aG developers alice",
        description: "这条命令把 alice 追加进 developers 附加组。关键是 -aG 必须一起用，否则可能覆盖她原来的附加组。",
      },
      {
        command: "id alice",
        description: "这条命令用于核对用户信息。通关时再查一次，能确认 developers 已经出现在她的组列表里。",
      },
    ],
    validation: { type: "user_in_group", expected: "alice:developers" },
    completed: false,
  },
  {
    id: 8,
    chapter: 2,
    title: "机密泄露！",
    description: "糟糕！salary.txt 这个工资文件谁都能看！先修复权限，再查看当前文件权限等级确认结果",
    objective: "先执行 chmod 600 /home/player/salary.txt，再执行 ls -l /home/player/salary.txt 或 stat /home/player/salary.txt 查看权限",
    hint: "这关也需要两步：先 chmod 600，再用 ls -l 或 stat 查看权限结果",
    command: "ls -l /home/player/salary.txt",
    knowledgeCards: [
      {
        command: "chmod 600 /home/player/salary.txt",
        description: "把 salary.txt 设置为只有所有者可读可写，其他人完全没有权限。",
      },
      {
        command: "ls -l /home/player/salary.txt",
        description: "用长格式查看文件权限、所有者和大小。权限部分会显示成类似 -rw-------。",
      },
      {
        command: "600 / 644 / 755 / 777",
        description: "权限数字是三段八进制：第一位是所有者，第二位是所属组，第三位是其他人。6=读+写(4+2)，4=只读，5=读+执行(4+1)，7=读+写+执行(4+2+1)，0=无权限。所以 600 表示仅所有者可读写；644 表示所有者可读写、其他人只读；755 常用于可执行脚本；777 表示所有人完全可操作，通常不安全。",
      },
    ],
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
      "团队要一起维护 /home/player/project 目录。把这个项目目录交给 developers 组协作使用：开发组成员需要能进入目录并修改内容，其他人只能查看，不能改动。",
    objective:
      "先把 /home/player/project 的属组改成 developers，再把目录权限设为 775，让所有者和开发组可读写执行，其他人只读可进入。",
    hint: "先用 chown :developers 改目录属组，再用 chmod 775 设置协作权限。",
    command:
      "chown :developers /home/player/project && chmod 775 /home/player/project",
    knowledgeCards: [
      {
        command: "chown :developers /home/player/project",
        description: "把 project 目录的所属组改成 developers。前面的冒号表示只改组，不改所有者。",
      },
      {
        command: "chmod 775 /home/player/project",
        description: "把目录权限设为 775：所有者和所属组可读写执行，其他人只能读和进入目录，不能写入。",
      },
      {
        command: "775",
        description: "目录上的 7 表示读、写、执行都有；最后一位 5 表示其他人只能读和执行。目录要能进入，通常需要执行权限 x。",
      },
    ],
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
    description: '线上发布前你要先跑一次 deploy.sh 做自检，但现在直接执行会报 "Permission denied"。先修复执行权限，再亲自把脚本跑成功确认输出。',
    objective: "先给 /home/player/deploy.sh 添加执行权限，再直接执行脚本，看到终端输出成功信息。",
    hint: "这关需要两步：先 chmod +x 或 chmod 755，再执行 ./deploy.sh 或 /home/player/deploy.sh。",
    command: "./deploy.sh",
    knowledgeCards: [
      {
        command: "chmod +x /home/player/deploy.sh",
        description: "给脚本增加可执行权限。对脚本文件来说，这是最常见的修复 Permission denied 的方式。",
      },
      {
        command: "./deploy.sh",
        description: "在当前目录直接执行脚本。前提是文件本身有执行权限，并且脚本开头有正确的 shebang。",
      },
      {
        command: "755 / +x",
        description: "755 表示所有者可读写执行，组和其他人可读执行。`chmod +x` 是在原权限基础上增加执行位，适合让脚本变得可直接运行。",
      },
    ],
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
