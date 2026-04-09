import type { Level } from "./types";

// Chapter 1: 基础命令 (Level 1-5)
export const chapter1Levels: Level[] = [
  {
    id: 1,
    chapter: 1,
    title: "你好，终端",
    description: "使用 ls 命令查看当前目录的内容",
    hint: "输入 ls 然后按回车键",
    command: "ls",
    knowledgeCards: [
      {
        command: "ls",
        description: "列出当前目录中的文件和文件夹，通常用来先看环境里有什么内容。",
      },
    ],
    validation: { type: "command", expected: "ls" },
    completed: false,
  },
  {
    id: 2,
    chapter: 1,
    title: "我在哪里",
    description: "使用 pwd 命令查看当前工作目录",
    hint: "pwd 是 print working directory 的缩写",
    command: "pwd",
    knowledgeCards: [
      {
        command: "pwd",
        description: "显示你当前所在的完整目录路径，适合在切换目录后确认自己现在的位置。",
      },
    ],
    validation: { type: "output_contains", expected: "/home/player" },
    completed: false,
  },
  {
    id: 3,
    chapter: 1,
    title: "切换目录",
    description: "你当前在 /tmp 目录，使用 cd 命令回到 home 目录",
    hint: "输入 cd ~ 或 cd /home/player 回到你的家目录",
    command: "cd ~",
    knowledgeCards: [
      {
        command: "cd ~",
        description: "切换到当前用户的 home 目录，`~` 是家目录的快捷写法。",
      },
      {
        command: "cd /home/player",
        description: "直接用绝对路径切换目录，效果和 `cd ~` 一样，但路径写得更明确。",
      },
    ],
    validation: { type: "command", expected: "cd_home" },
    completed: false,
  },
  {
    id: 4,
    chapter: 1,
    title: "清空屏幕",
    description: "使用 clear 命令清空终端屏幕",
    hint: "输入 clear 来清理屏幕",
    command: "clear",
    knowledgeCards: [
      {
        command: "clear",
        description: "清空当前终端显示内容，方便你在输出很多时重新整理视野。",
      },
    ],
    validation: { type: "command", expected: "clear" },
    completed: false,
  },
  {
    id: 5,
    chapter: 1,
    title: "命令历史",
    description: "使用 history 命令查看之前执行过的命令，这一关已为你预置了几条历史记录",
    hint: "输入 history，你会看到预置的 ls、pwd、clear 等命令记录",
    command: "history",
    knowledgeCards: [
      {
        command: "history",
        description: "查看当前会话中执行过的命令历史，这一关会预置几条记录，便于你直接观察输出。",
      },
    ],
    validation: { type: "command", expected: "history" },
    completed: false,
  },
];
