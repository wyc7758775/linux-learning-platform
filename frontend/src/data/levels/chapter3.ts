import type { Level } from "./types";

// Chapter 3: 事故响应 (Level 13-20)
export const chapter3Levels: Level[] = [
  {
    id: 13,
    chapter: 3,
    title: "第一响应",
    description:
      "凌晨 2:17，监控告警：服务器 CPU 飙到 99%！找出是哪个进程在作怪，上报给值班经理。",
    hint: "ps aux 列出所有进程；--sort=-%cpu 按 CPU 降序排列；| head -5 只看前 5 行",
    command: "ps aux --sort=-%cpu | head -5",
    objective: "用命令找出当前 CPU 占用最高的进程名",
    knowledgeCards: [
      {
        command: "ps aux",
        description: "列出系统中所有正在运行的进程",
        flags: [
          { flag: "-a", meaning: "显示所有用户的进程" },
          { flag: "-u", meaning: "以用户友好格式显示（含 CPU/内存使用率）" },
          { flag: "-x", meaning: "包含没有控制终端的后台进程" },
        ],
      },
      {
        command: "--sort=-%cpu",
        description: "按 CPU 使用率从高到低排序（- 代表降序，%cpu 是排序字段）",
      },
      {
        command: "| head -5",
        description:
          "管道符 | 把前一个命令的输出传给下一个命令；head -5 只显示前 5 行",
      },
    ],
    validation: { type: "output_contains", expected: "stress-worker" },
    completed: false,
  },
  {
    id: 14,
    chapter: 3,
    title: "磁盘告急",
    description:
      "日志分区使用率 95%！必须马上找出哪个目录在疯狂占用磁盘，否则服务器会崩。",
    hint: "du -sh /var/log/* 统计各目录大小；| sort -rh 按大小降序；| head -5 只看最大的几个",
    command: "du -sh /var/log/* | sort -rh | head -5",
    objective: "找出 /var/log 下占用磁盘空间最大的目录",
    knowledgeCards: [
      {
        command: "du",
        description: "统计文件或目录占用的磁盘空间（disk usage）",
        flags: [
          { flag: "-s", meaning: "只显示汇总（不展开子目录列表）" },
          { flag: "-h", meaning: "人类可读格式：自动换算成 K / M / G" },
        ],
      },
      {
        command: "sort -rh",
        description:
          "排序：-r 降序（最大的在前），-h 能识别 K/M/G 等单位正确比较大小",
      },
      {
        command: "/var/log/*",
        description: "通配符 * 匹配 /var/log 下的所有文件和目录",
      },
    ],
    validation: { type: "output_contains", expected: "/var/log/nginx" },
    completed: false,
  },
  {
    id: 15,
    chapter: 3,
    title: "端口被占",
    description:
      "重启应用服务失败！报错：Address already in use: 8080。有进程抢先占了端口，必须找出它。",
    hint: "ss -tlnp 查看所有监听端口和进程；或者 netstat -tlnp；用 | grep 8080 过滤",
    command: "ss -tlnp | grep 8080",
    objective: "找出正在占用 8080 端口的进程",
    knowledgeCards: [
      {
        command: "ss",
        description:
          "查看套接字连接状态（socket statistics），比老的 netstat 更快",
        flags: [
          { flag: "-t", meaning: "只显示 TCP 连接" },
          { flag: "-l", meaning: "只显示处于监听（LISTEN）状态的端口" },
          { flag: "-n", meaning: "不把端口号解析为服务名，直接显示数字" },
          { flag: "-p", meaning: "显示占用该端口的进程信息（PID/进程名）" },
        ],
      },
      {
        command: "| grep 8080",
        description: "从 ss 的输出中过滤包含 8080 的行，快速定位目标端口",
      },
    ],
    validation: { type: "output_contains", expected: "8080" },
    completed: false,
  },
  {
    id: 16,
    chapter: 3,
    title: "日志追踪",
    description:
      "用户反馈页面一直报错。需要从 nginx 日志里把所有 HTTP 500 错误都揪出来，看看到底出了什么问题。",
    hint: 'grep " 500 " /var/log/nginx/access.log 过滤 500 状态码（注意两侧有空格，避免误匹配）',
    command: 'grep " 500 " /var/log/nginx/access.log',
    objective: "从 /var/log/nginx/access.log 中找出所有 HTTP 500 错误记录",
    knowledgeCards: [
      {
        command: "grep",
        description: "在文件中搜索匹配指定模式的行，并输出这些行",
        flags: [
          { flag: '"模式"', meaning: "要搜索的字符串，加引号避免特殊字符干扰" },
          { flag: "-c", meaning: "只输出匹配行的数量（不显示内容）" },
          { flag: "-i", meaning: "忽略大小写" },
          { flag: "-n", meaning: "在每行前面显示行号" },
        ],
      },
      {
        command: '" 500 "（两侧有空格）',
        description:
          "搜索 HTTP 状态码 500；两侧加空格是为了精确匹配，避免误匹配到 URL 中含 500 的路径",
      },
    ],
    validation: { type: "output_lines_gte", expected: "40" },
    completed: false,
  },
  {
    id: 17,
    chapter: 3,
    title: "统计告警",
    description:
      '值班经理在群里@你："今天 app 服务总共报了多少个 ERROR？给我一个数字！" 日志文件在 /var/log/app/app.log。',
    hint: 'grep "ERROR" /var/log/app/app.log 找出 ERROR 行；| wc -l 统计行数',
    command: 'grep "ERROR" /var/log/app/app.log | wc -l',
    objective: "统计 /var/log/app/app.log 中 ERROR 级别日志的总行数",
    knowledgeCards: [
      {
        command: 'grep "ERROR"',
        description: "过滤出包含 ERROR 字符串的行",
      },
      {
        command: "wc -l",
        description:
          "统计行数；wc 是 word count，-l 参数改为统计行数（line count）",
      },
      {
        command: "|（管道符）",
        description:
          "把左边命令的输出（一行行的 ERROR 日志）直接作为右边命令（wc -l）的输入来统计",
      },
    ],
    validation: { type: "output_number", expected: "312" },
    completed: false,
  },
  {
    id: 18,
    chapter: 3,
    title: "IP 追凶",
    description:
      "怀疑有人在疯狂刷接口！需要从 nginx 日志中统计每个 IP 的访问量，找出访问次数最多的 5 个 IP。",
    hint: "awk '{print $1}' 提取第一列（IP）；| sort 排序让相同 IP 聚集；| uniq -c 统计相邻重复；| sort -rn 按数字降序；| head -5",
    command:
      "awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -5",
    objective: "找出 /var/log/nginx/access.log 中访问量最高的 5 个 IP 地址",
    knowledgeCards: [
      {
        command: "awk '{print $1}'",
        description:
          "提取每行的第 1 个字段（以空格分隔）；nginx 日志第 1 列就是客户端 IP",
      },
      {
        command: "sort",
        description:
          "对行进行排序，让相同的 IP 地址聚集在一起（uniq 只对相邻重复行有效）",
      },
      {
        command: "uniq -c",
        description: "对连续相同的行去重，并在行首加上该行出现的次数",
      },
      {
        command: "sort -rn",
        description:
          "再次排序：-r 降序（次数多的在前），-n 按数字大小比较（而非字母顺序）",
      },
    ],
    validation: { type: "output_contains", expected: "10.66.6.6" },
    completed: false,
  },
  {
    id: 19,
    chapter: 3,
    title: "时间取证",
    description:
      "技术委员会要开复盘会议。需要回答：告警时段（02:17 这一分钟）内，nginx 收到了多少个 HTTP 500 错误？",
    hint: 'grep "02:17" 过滤时段；再 | grep " 500 " 过滤状态码；最后 | wc -l 统计数量',
    command: 'grep "02:17" /var/log/nginx/access.log | grep " 500 " | wc -l',
    objective: "统计 02:17 这一分钟内 nginx 日志中 HTTP 500 错误的数量",
    knowledgeCards: [
      {
        command: "多级管道过滤",
        description:
          "先用第一个 grep 缩小范围（时间），再用第二个 grep 进一步过滤（状态码），最后统计——这是日志分析的经典模式",
      },
      {
        command: 'grep "02:17"',
        description: "过滤出时间戳包含 02:17 的日志行（精确到分钟）",
      },
      {
        command: 'grep " 500 "',
        description: "在已过滤的结果中继续过滤 HTTP 500 状态码",
      },
    ],
    validation: { type: "output_number", expected: "23" },
    completed: false,
  },
  {
    id: 20,
    chapter: 3,
    title: "终极取证",
    description:
      "最后一个问题，也是最关键的证据：在告警时段（02:17）内，是谁发出了最多的请求？请给出 IP 地址和请求次数。",
    hint: 'grep "02:17" 先过滤时段；再 awk 提取 IP；再 sort | uniq -c | sort -rn 统计排序；最后 head -3 取前 3',
    command:
      "grep '02:17' /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -3",
    objective: "找出告警时段（02:17）内访问量最高的 IP 及其请求次数",
    knowledgeCards: [
      {
        command: "完整管道链",
        description:
          "先过滤时段 → 提取 IP → 排序聚合 → 计数 → 降序排列 → 取Top3。这是真实安全事故分析的标准套路。",
      },
      {
        command: 'grep "02:17" | awk ... | sort | uniq -c | sort -rn',
        description:
          "5 个命令串联：每个命令只做一件事，通过管道协同完成复杂任务——这就是 Unix 哲学",
      },
    ],
    validation: { type: "output_contains", expected: "182" },
    completed: false,
  },
];
