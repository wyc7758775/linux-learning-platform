export type ErrorType =
  | "permission"
  | "notfound"
  | "syntax"
  | "command"
  | "empty"
  | "logic";

export interface ErrorAnalysisResult {
  type: ErrorType;
  label: string;
  description: string;
  advice: string[];
  relatedCommands: string[];
}

const EXPLORATORY_COMMANDS = new Set([
  "ls",
  "cat",
  "pwd",
  "cd",
  "echo",
  "man",
  "help",
  "which",
  "type",
  "whoami",
  "clear",
  "history",
  "head",
  "tail",
  "less",
  "more",
]);

const ERROR_ANALYSIS: Record<ErrorType, Omit<ErrorAnalysisResult, "type">> = {
  permission: {
    label: "权限不足",
    description:
      "命令方向通常是对的，但当前用户权限不够，系统拒绝了这次操作。",
    advice: [
      "先确认题目是否要求使用 root 权限或 sudo。",
      "检查目标文件或目录的属主、属组和权限位。",
      "涉及用户、用户组、系统目录时，优先怀疑权限问题。",
      "如果是脚本无法执行，检查是否缺少执行权限。",
      "执行前先用 ls -l 或 id 看清当前身份和权限状态。",
    ],
    relatedCommands: ["sudo", "chmod", "chown", "chgrp", "id", "ls -l"],
  },
  notfound: {
    label: "文件或路径不存在",
    description:
      "命令本身能执行，但目标文件、目录或路径写错了，系统找不到要操作的对象。",
    advice: [
      "先确认当前目录，再决定是否要用绝对路径。",
      "检查文件名大小写、后缀和层级是否完全一致。",
      "先用 ls 或 find 验证目标确实存在。",
      "如果路径来自题目提示，优先按提示里的目录重新定位。",
      "批量命令前先单独验证关键路径，避免后续操作都落空。",
    ],
    relatedCommands: ["pwd", "ls", "find", "stat", "cd"],
  },
  syntax: {
    label: "语法错误",
    description:
      "命令或脚本结构有问题，Shell 在解析阶段就失败了，通常不是业务逻辑问题。",
    advice: [
      "检查括号、引号、管道和重定向是否闭合或配对。",
      "Shell 脚本重点检查 if/then/fi、for/do/done 等结构。",
      "把长命令拆成几段单独执行，先定位哪一段写错。",
      "遇到脚本错误时用 bash -n 先做静态语法检查。",
      "命令参数顺序不确定时，先回看该命令的标准写法。",
    ],
    relatedCommands: ["bash -n", "sh -n", "printf", "grep", "sed"],
  },
  command: {
    label: "命令不存在",
    description:
      "系统里没有这个命令，可能是命令名拼错了，也可能是相关软件包还没安装。",
    advice: [
      "先确认命令名是否拼写正确，特别是缩写和连字符。",
      "用 which 或 type 检查系统里是否真的存在该命令。",
      "如果是工具缺失，安装对应软件包后再执行。",
      "题目若给了替代命令，优先使用题目推荐的那个。",
      "注意 busybox 或 alpine 环境下，部分命令名字和参数会不同。",
    ],
    relatedCommands: ["which", "type", "apk add", "apt install", "yum install"],
  },
  empty: {
    label: "空命令或无有效输出",
    description:
      "这次执行没有形成有效反馈，要么命令没真正输入，要么结果没有命中题目的判断条件。",
    advice: [
      "先确认自己提交的不是空命令或仅空格。",
      "命令执行成功但没过题时，检查输出内容是否符合要求。",
      "如果题目要求筛选结果，补上 grep、head、tail 等处理步骤。",
      "观察命令是否被重定向到文件，导致终端看起来没有输出。",
      "先执行一个最小可验证版本，再逐步补上完整参数。",
    ],
    relatedCommands: ["echo", "grep", "head", "tail", "wc -l"],
  },
  logic: {
    label: "逻辑错误",
    description:
      "命令能跑通，但执行思路和题目要求不一致，结果没有落到正确目标上。",
    advice: [
      "重新读题，确认题目要的是修改状态、查看信息还是生成输出。",
      "把期望结果拆成几个条件，逐个验证是否真的满足。",
      "先对照提示，找出最关键的命令对象和参数。",
      "如果用了组合命令，拆开逐步执行，观察每一步结果。",
      "优先验证最终状态，不要只看命令是否执行成功。",
    ],
    relatedCommands: ["grep", "awk", "sort", "uniq", "chmod", "systemctl"],
  },
};

function getPrimaryCommand(command: string): string {
  const tokens = command.trim().split(/\s+/).filter(Boolean);
  if (tokens[0] === "sudo") {
    return tokens[1] || "";
  }
  return tokens[0] || "";
}

export function isExploratoryCommand(command: string): boolean {
  return EXPLORATORY_COMMANDS.has(getPrimaryCommand(command));
}

export function getErrorType(
  command: string,
  output: string,
  forcedType?: string,
): ErrorType {
  if (forcedType && forcedType in ERROR_ANALYSIS) {
    return forcedType as ErrorType;
  }

  const normalizedCommand = command.trim();
  const normalizedOutput = output.trim();

  if (!normalizedCommand || !normalizedOutput) {
    return "empty";
  }

  if (/permission denied|are you root/i.test(normalizedOutput)) {
    return "permission";
  }

  if (/no such file|not found|cannot access/i.test(normalizedOutput)) {
    return "notfound";
  }

  if (/syntax error/i.test(normalizedOutput)) {
    return "syntax";
  }

  if (/command not found/i.test(normalizedOutput)) {
    return "command";
  }

  return "logic";
}

export function classifyError(
  command: string,
  output: string,
  forcedType?: string,
): ErrorAnalysisResult {
  const type = getErrorType(command, output, forcedType);
  return {
    type,
    ...ERROR_ANALYSIS[type],
  };
}
