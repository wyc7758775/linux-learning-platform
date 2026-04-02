import type { Level } from "./types";

// Chapter 6: 脚本编程 (Level 41-50)
export const chapter6Levels: Level[] = [
  {
    id: 41,
    chapter: 6,
    title: "第一个脚本",
    description:
      '运维新人接到任务：写一个系统信息报告脚本 report.sh，输出 "System Report" 标题和当前用户名',
    hint: "用 echo 输出标题，用 whoami 获取用户名。脚本第一行写 #!/bin/bash，然后运行 bash report.sh",
    command: "bash report.sh",
    objective: "创建并执行第一个 bash 脚本，理解 shebang 和脚本执行方式",
    knowledgeCards: [
      {
        command: "#!/bin/bash（shebang）",
        description:
          "脚本第一行，告诉系统用哪个解释器执行脚本。#!/bin/bash 使用 bash，#!/bin/sh 使用 sh",
      },
      {
        command: "bash script.sh",
        description:
          "直接用 bash 解释器执行脚本，无需可执行权限。等价于 ./script.sh（需要 chmod +x）",
      },
      {
        command: "whoami",
        description: "输出当前用户名，等价于 id -un",
      },
    ],
    validation: { type: "output_contains", expected: "System Report" },
    completed: false,
  },
  {
    id: 42,
    chapter: 6,
    title: "变量与替换",
    description:
      "服务器的 IP、端口、部署路径经常变动。用变量定义 SERVER_IP、PORT、DEPLOY_PATH，并输出配置摘要",
    hint: "用 VAR=value 赋值（等号两边不能有空格），用 $VAR 或 ${VAR} 引用变量",
    command: "bash config.sh",
    objective: "掌握变量赋值、引用和字符串拼接",
    knowledgeCards: [
      {
        command: "变量赋值",
        description:
          "VAR=value（等号两边不能有空格）。引用：$VAR 或 ${VAR}。花括号形式用于拼接：${VAR}_log",
      },
      {
        command: "双引号 vs 单引号",
        description:
          "\"$VAR\" 会替换变量值，'$VAR' 原样输出。推荐双引号包裹含变量的字符串",
      },
      {
        command: "命令替换 $(...)",
        description:
          "把命令输出赋给变量：DATE=$(date +%Y-%m-%d)。反引号 `date` 也可以但不如 $() 嵌套方便",
      },
    ],
    validation: {
      type: "file_content_contains",
      expected: "/home/player/config.sh:SERVER_IP",
    },
    completed: false,
  },
  {
    id: 43,
    chapter: 6,
    title: "读取输入",
    description:
      '部署脚本需要确认目标环境。编写 deploy_env.sh，用 read 询问"请输入目标环境(dev/staging/prod):"，然后输出"Deploying to [环境名]"',
    hint: 'read -p "提示信息" VAR 读取用户输入到变量 VAR，然后用 echo 输出结果',
    command: "bash deploy_env.sh",
    objective: "掌握 read 命令获取用户交互式输入",
    knowledgeCards: [
      {
        command: "read VAR",
        description:
          '从标准输入读取一行赋给变量 VAR。常用选项：-p "提示" 显示提示，-s 隐藏输入（密码），-t 5 超时 5 秒',
      },
      {
        command: 'read -p "提示" VAR',
        description: '显示提示信息并等待输入，等价于 echo -n "提示"; read VAR',
      },
    ],
    validation: {
      type: "file_content_contains",
      expected: "/home/player/deploy_env.sh:read",
    },
    completed: false,
  },
  {
    id: 44,
    chapter: 6,
    title: "条件判断",
    description:
      '检查 /home/player/app.log 是否存在：存在则输出"Log file found"，不存在则输出"Log file not found"',
    hint: "if [ -f 文件路径 ]; then ... elif ... ; else ...; fi。-f 检查文件是否存在，-d 检查目录",
    command: "bash check.sh",
    objective: "掌握 if/elif/else 条件分支和文件测试操作符",
    knowledgeCards: [
      {
        command: "if [ 条件 ]; then ... fi",
        description:
          "基本条件判断。[ ] 等价于 test 命令。注意 [ 后和 ] 前必须有空格",
      },
      {
        command: "文件测试操作符",
        description:
          "-f 文件存在且为普通文件, -d 目录存在, -e 存在, -r 可读, -w 可写, -x 可执行, -s 非空",
        flags: [
          { flag: "-f", meaning: "文件存在且为普通文件" },
          { flag: "-d", meaning: "路径存在且为目录" },
          { flag: "-e", meaning: "路径存在（不限类型）" },
          { flag: "-s", meaning: "文件存在且非空" },
        ],
      },
      {
        command: "字符串比较",
        description:
          '"$a" = "$b" 相等，"$a" != "$b" 不等，-z "$a" 为空，-n "$a" 非空',
      },
      {
        command: "数值比较",
        description:
          "-eq 等于, -ne 不等于, -gt 大于, -lt 小于, -ge 大于等于, -le 小于等于",
        flags: [
          { flag: "-eq", meaning: "等于 (equal)" },
          { flag: "-ne", meaning: "不等于 (not equal)" },
          { flag: "-gt", meaning: "大于 (greater than)" },
          { flag: "-lt", meaning: "小于 (less than)" },
        ],
      },
    ],
    validation: {
      type: "file_content_contains",
      expected: "/home/player/check.sh:if",
    },
    completed: false,
  },
  {
    id: 45,
    chapter: 6,
    title: "退出码与逻辑",
    description:
      '编写脚本 safe_rm.sh：先用 test -f 检查文件是否存在，存在则删除并输出"Deleted"，不存在则输出"File not found"并以 exit 1 退出',
    hint: "命令成功返回 $?=0，失败非 0。用 exit 1 明确返回失败状态。上一条命令的退出码用 $? 获取",
    command: "bash safe_rm.sh",
    objective: "理解退出码 $?, exit 语句, && 和 || 短路逻辑",
    knowledgeCards: [
      {
        command: "$?（退出码）",
        description:
          "上一条命令的返回值。0 表示成功，非 0 表示失败。脚本中用 exit N 返回指定退出码",
      },
      {
        command: "exit N",
        description:
          "终止脚本并返回退出码 N。exit 0 表示成功，exit 1 表示一般错误",
      },
      {
        command: "&& 和 ||（短路逻辑）",
        description:
          "cmd1 && cmd2：cmd1 成功才执行 cmd2。cmd1 || cmd2：cmd1 失败才执行 cmd2",
      },
    ],
    validation: {
      type: "file_content_contains",
      expected: "/home/player/safe_rm.sh:exit",
    },
    completed: false,
  },
  {
    id: 46,
    chapter: 6,
    title: "循环遍历",
    description:
      '编写 disk_check.sh，用 for 循环检查 /home、/var、/tmp 三个目录的磁盘使用情况，对每个目录输出 "Checking [目录] ... done"',
    hint: 'for dir in /home /var /tmp; do echo "Checking $dir ... done"; done',
    command: "bash disk_check.sh",
    objective: "掌握 for...in 循环和 C 风格 for 循环",
    knowledgeCards: [
      {
        command: "for VAR in 列表; do ... done",
        description:
          "遍历列表中的每个元素。列表可以是空格分隔的值、命令替换结果或通配符展开",
      },
      {
        command: "for ((i=0; i<N; i++)); do ... done",
        description:
          "C 风格 for 循环，适合需要数值递增的场景。双括号内可以使用 < > <= >= 等数学比较",
      },
      {
        command: "seq 1 10",
        description: "生成数字序列 1 到 10。配合 for i in $(seq 1 10) 使用",
      },
    ],
    validation: {
      type: "output_contains",
      expected: "Checking /home ... done",
    },
    completed: false,
  },
  {
    id: 47,
    chapter: 6,
    title: "循环读取",
    description:
      '编写 log_stats.sh，逐行读取 /var/log/nginx/access.log，统计请求总数并输出"Total requests: [数量]"',
    hint: "while read line; do ... done < 文件。用计数器变量 count=$((count+1)) 累加",
    command: "bash log_stats.sh",
    objective: "掌握 while read 逐行读取文件内容和管道结合循环",
    knowledgeCards: [
      {
        command: "while read LINE; do ... done < file",
        description:
          "逐行读取文件，每次循环 LINE 变量包含一行内容。文件末尾自动退出循环",
      },
      {
        command: "cat file | while read LINE",
        description:
          "管道方式逐行读取。注意：管道中的 while 在子 shell 中运行，循环内的变量修改不会影响外部",
      },
      {
        command: "算术运算 $(())",
        description:
          "$((a+b)) 整数运算。支持 + - * / %（取模）。赋值：count=$((count+1)) 或 ((count++))",
      },
    ],
    validation: { type: "output_contains", expected: "Total requests:" },
    completed: false,
  },
  {
    id: 48,
    chapter: 6,
    title: "函数封装",
    description:
      '编写 monitor.sh，定义 check_service() 函数：接收服务名参数 $1，输出"Checking [服务名]... OK"。调用该函数检查 nginx 和 sshd 两个服务',
    hint: '函数定义：check_service() { echo "Checking $1... OK"; }。调用：check_service nginx',
    command: "bash monitor.sh",
    objective: "掌握函数定义、参数传递和返回值",
    knowledgeCards: [
      {
        command: "函数定义与调用",
        description:
          "func_name() { commands; } 或 function func_name { commands; }。调用时不加括号：func_name arg1 arg2",
      },
      {
        command: "函数参数",
        description:
          "函数内用 $1 $2 ... 访问参数，$# 参数个数，$@ 所有参数。与脚本参数用法相同",
      },
      {
        command: "return vs echo",
        description:
          'return N 返回退出码（0-255），用 $? 获取。echo "value" 返回字符串，用 result=$(func) 捕获',
      },
    ],
    validation: { type: "output_contains", expected: "Checking nginx... OK" },
    completed: false,
  },
  {
    id: 49,
    chapter: 6,
    title: "字符串处理",
    description:
      '/home/player/app.conf 是一个配置文件。编写 parse.sh，提取其中 SERVER_NAME 的值并输出"Server: [值]"',
    hint: "用 grep 找到行，再用 cut -d= -f2 提取值。或用 ${var#*=} 参数扩展截取等号后的内容",
    command: "bash parse.sh",
    objective: "掌握字符串截取、cut、awk 等文本处理技巧",
    knowledgeCards: [
      {
        command: "参数扩展（字符串截取）",
        description:
          "${var#pattern} 删最短前缀, ${var##pattern} 删最长前缀, ${var%pattern} 删最短后缀, ${var%%pattern} 删最长后缀",
        flags: [
          { flag: "${var#*=}", meaning: "删除从开头到第一个 = 的部分" },
          { flag: "${var##*=}", meaning: "删除从开头到最后一个 = 的部分" },
          { flag: "${var%:*}", meaning: "删除从最后一个 : 到末尾的部分" },
        ],
      },
      {
        command: "cut -d分隔符 -f字段",
        description:
          "按分隔符切割每行并提取字段。cut -d= -f2 提取等号后的第二个字段。cut -d: -f1,3 提取第 1、3 字段",
      },
      {
        command: "awk -F分隔符 '{print $N}'",
        description:
          "比 cut 更强大的文本处理工具。awk -F= '{print $2}' 提取等号后内容，支持条件、循环、函数",
      },
    ],
    validation: { type: "output_contains", expected: "Server:" },
    completed: false,
  },
  {
    id: 50,
    chapter: 6,
    title: "服务器健康检查",
    description:
      '综合实战！编写 healthcheck.sh，用函数+循环检查 CPU 负载、磁盘空间、内存使用、关键进程，输出"Health Check Report"和各项结果',
    hint: "综合运用变量、函数、条件、循环。定义 check_disk()、check_memory() 等函数，主流程依次调用并汇总",
    command: "bash healthcheck.sh",
    objective: "综合运用变量、条件、循环、函数编写完整的服务器健康检查脚本",
    knowledgeCards: [
      {
        command: "脚本最佳实践",
        description:
          "1. set -e 遇错即停 2. set -u 使用未定义变量报错 3. 用函数组织逻辑 4. 关键操作加日志输出",
      },
      {
        command: "df -h",
        description:
          "显示磁盘使用情况。-h 人类可读格式（KB/MB/GB）。df -h / 查看 / 分区用量",
      },
      {
        command: "free -m",
        description:
          "显示内存使用情况。-m 以 MB 为单位。free -m | awk '/Mem/{print $3/$2*100}' 获取内存使用百分比",
      },
      {
        command: "ps aux | grep",
        description:
          "检查特定进程是否运行。pgrep -x nginx 比 ps | grep 更精确（不会匹配 grep 自身）",
      },
    ],
    validation: { type: "output_contains", expected: "Health Check Report" },
    completed: false,
  },
];
