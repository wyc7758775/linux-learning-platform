import { useState, useEffect } from "react";
import { Level } from "./components/Level/Level";
import { Terminal } from "./components/Terminal/Terminal";
import { Progress } from "./components/Progress/Progress";
import { ThemeToggle } from "./components/ThemeToggle/ThemeToggle";
import { AvatarPicker } from "./components/AvatarPicker/AvatarPicker";
import { useTheme } from "./contexts/ThemeContext";
import { useAuth } from "./contexts/AuthContext";
import { socket, connectSocket } from "./services/socket";
import { userApi } from "./services/api";
import type { Level as LevelType } from "./levels";

const LEVELS: LevelType[] = [
  // Chapter 1: 基础命令
  {
    id: 1,
    chapter: 1,
    title: "你好，终端",
    description: "使用 ls 命令查看当前目录的内容",
    hint: "输入 ls 然后按回车键",
    command: "ls",
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
    validation: { type: "output_contains", expected: "/home/player" },
    completed: false,
  },
  {
    id: 3,
    chapter: 1,
    title: "切换目录",
    description: "使用 cd 命令进入 home 目录",
    hint: "输入 cd ~ 或 cd /home/player",
    command: "cd",
    validation: { type: "command", expected: "cd" },
    completed: false,
  },
  {
    id: 4,
    chapter: 1,
    title: "清空屏幕",
    description: "使用 clear 命令清空终端屏幕",
    hint: "输入 clear 来清理屏幕",
    command: "clear",
    validation: { type: "command", expected: "clear" },
    completed: false,
  },
  {
    id: 5,
    chapter: 1,
    title: "命令历史",
    description: "使用 history 命令查看之前执行过的命令",
    hint: "history 命令可以显示你输入过的所有命令",
    command: "history",
    validation: { type: "command", expected: "history" },
    completed: false,
  },
  // Chapter 2: 权限实战
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
  // Chapter 3: 事故响应
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
  // Chapter 4: 部署上线
  {
    id: 21,
    chapter: 4,
    title: "构建打包",
    description: "Vue 项目开发完成！执行构建命令，生成部署产物",
    hint: "进入 /home/player/my-app 目录，运行 npm run build",
    command: "cd /home/player/my-app && npm run build",
    objective: "构建前端项目，生成 dist 目录",
    knowledgeCards: [
      {
        command: "npm run build",
        description:
          "执行 package.json 中定义的构建脚本，将源代码编译成可部署的静态文件",
        flags: [
          { flag: "--mode", meaning: "指定构建模式（development/production）" },
          { flag: "--watch", meaning: "监听文件变化，自动重新构建" },
        ],
      },
      {
        command: "dist/",
        description:
          "构建产物默认输出目录，包含 index.html、打包后的 JS/CSS 等静态资源",
      },
    ],
    validation: {
      type: "directory_exists",
      expected: "/home/player/my-app/dist",
    },
    completed: false,
  },
  {
    id: 22,
    chapter: 4,
    title: "构建产物",
    description: "构建完成！查看打包后生成了哪些文件，了解产物结构",
    hint: "使用 ls -lh dist/ 查看文件列表和大小",
    command: "ls -lh /home/player/my-app/dist/",
    objective: "查看构建产物目录内容",
    knowledgeCards: [
      {
        command: "ls -lh",
        description: "以人类可读的格式显示文件详情",
        flags: [
          { flag: "-l", meaning: "长格式显示（权限、大小、时间等）" },
          { flag: "-h", meaning: "人类可读大小（K/M/G）" },
        ],
      },
      {
        command: "构建产物结构",
        description:
          "index.html 是入口文件，assets/ 包含打包后的 JS/CSS，.map 文件用于调试",
      },
    ],
    validation: { type: "output_contains", expected: "index.html" },
    completed: false,
  },
  {
    id: 23,
    chapter: 4,
    title: "部署文件",
    description: "构建产物准备好了！把它们复制到 Web 服务器的根目录",
    hint: "使用 cp -r 递归复制目录内容到 /var/www/html/",
    command: "cp -r /home/player/my-app/dist/* /var/www/html/",
    objective: "将构建产物部署到 Web 服务器根目录",
    knowledgeCards: [
      {
        command: "cp -r",
        description: "递归复制文件和目录",
        flags: [
          { flag: "-r", meaning: "递归复制目录及其内容" },
          { flag: "-p", meaning: "保留文件属性（权限、时间戳）" },
          { flag: "-v", meaning: "显示复制过程" },
        ],
      },
      {
        command: "/var/www/html/",
        description: "Nginx 默认的静态文件根目录，Web 服务器从这里提供文件",
      },
    ],
    validation: { type: "file_exists", expected: "/var/www/html/index.html" },
    completed: false,
  },
  {
    id: 24,
    chapter: 4,
    title: "了解配置",
    description: "文件就位！启动 Nginx 之前，先了解它的配置文件结构",
    hint: "使用 cat /etc/nginx/nginx.conf 查看主配置文件",
    command: "cat /etc/nginx/nginx.conf",
    objective: "查看 Nginx 配置文件结构",
    knowledgeCards: [
      {
        command: "/etc/nginx/nginx.conf",
        description: "Nginx 主配置文件，包含全局设置和 HTTP 服务器配置",
      },
      {
        command: "配置块结构",
        description:
          "events {} 处理连接，http {} 定义 HTTP 服务器，server {} 定义虚拟主机，location {} 定义路径规则",
      },
    ],
    validation: { type: "output_contains", expected: "http" },
    completed: false,
  },
  {
    id: 25,
    chapter: 4,
    title: "配置虚拟主机",
    description:
      "默认配置能用，但我们要为应用写一个专属配置！在 /etc/nginx/http.d/ 创建 myapp.conf",
    hint: "使用 nano 或 vim 创建配置文件，写入 server 块配置",
    command: "nano /etc/nginx/http.d/myapp.conf",
    objective: "创建应用专属的 Nginx 配置文件",
    knowledgeCards: [
      {
        command: "server block",
        description: "定义虚拟主机，包括监听端口、域名、根目录等",
      },
      {
        command: "location / {}",
        description: "定义 URL 路径匹配规则，可以配置代理、静态文件服务等",
      },
      {
        command: "try_files",
        description: "SPA 应用必备：尝试匹配文件，找不到则返回 index.html",
      },
    ],
    validation: {
      type: "file_exists",
      expected: "/etc/nginx/http.d/myapp.conf",
    },
    completed: false,
  },
  {
    id: 26,
    chapter: 4,
    title: "检查配置",
    description: "配置写好了！重启服务前先检查语法——这是运维的好习惯",
    hint: "使用 sudo nginx -t 检查配置语法",
    command: "sudo nginx -t",
    objective: "验证 Nginx 配置文件语法",
    knowledgeCards: [
      {
        command: "nginx -t",
        description: "测试配置文件语法，不实际启动服务",
        flags: [
          { flag: "-t", meaning: "测试配置语法" },
          { flag: "-T", meaning: "测试并显示完整配置" },
        ],
      },
      {
        command: "运维最佳实践",
        description:
          "修改配置后先 nginx -t 检查，确认无误再 reload，避免服务中断",
      },
    ],
    validation: { type: "output_contains", expected: "syntax is ok" },
    completed: false,
  },
  {
    id: 27,
    chapter: 4,
    title: "启动服务",
    description: "配置检查通过！启动 Nginx 服务，网站正式上线！",
    hint: "使用 sudo nginx 启动服务，用 ps aux | grep nginx 确认进程运行",
    command: "sudo nginx",
    objective: "启动 Nginx 服务并确认进程运行",
    knowledgeCards: [
      {
        command: "nginx",
        description: "启动 Nginx 服务器",
        flags: [
          { flag: "-s reload", meaning: "重载配置（不中断服务）" },
          { flag: "-s stop", meaning: "快速停止" },
          { flag: "-s quit", meaning: "优雅停止（处理完当前请求）" },
        ],
      },
      {
        command: "ps aux | grep nginx",
        description: "查看 Nginx 进程状态，master 进程管理 worker 进程",
      },
    ],
    validation: { type: "nginx_running", expected: "nginx: master" },
    completed: false,
  },
  {
    id: 28,
    chapter: 4,
    title: "测试访问",
    description: "Nginx 启动了！用 curl 测试网站是否正常响应",
    hint: "使用 curl localhost 发送 HTTP 请求",
    command: "curl -s localhost",
    objective: "测试网站是否正常响应",
    knowledgeCards: [
      {
        command: "curl",
        description: "命令行 HTTP 客户端，用于测试 API 和网站",
        flags: [
          { flag: "-I", meaning: "只获取响应头" },
          { flag: "-s", meaning: "静默模式（不显示进度）" },
          { flag: "-v", meaning: "显示详细信息" },
          { flag: "-X POST", meaning: "指定请求方法" },
        ],
      },
      {
        command: "HTTP 状态码",
        description: "200 成功，301/302 重定向，404 未找到，500 服务器错误",
      },
    ],
    validation: { type: "output_contains", expected: "<html" },
    completed: false,
  },
  {
    id: 29,
    chapter: 4,
    title: "查看日志",
    description: "网站上线了！查看访问日志，了解请求记录——运维日常",
    hint: "访问日志在 /var/log/nginx/access.log，使用 tail 查看最后几行",
    command: "tail /var/log/nginx/access.log",
    objective: "查看 Nginx 访问日志",
    knowledgeCards: [
      {
        command: "tail",
        description: "显示文件末尾内容",
        flags: [
          { flag: "-n 20", meaning: "显示最后 20 行" },
          { flag: "-f", meaning: "实时跟踪文件变化" },
        ],
      },
      {
        command: "日志文件位置",
        description:
          "access.log 记录请求，error.log 记录错误，默认在 /var/log/nginx/",
      },
      {
        command: "日志格式",
        description: "通常包含：IP、时间、请求方法、路径、状态码、响应大小等",
      },
    ],
    validation: { type: "output_contains", expected: "GET" },
    completed: false,
  },
  {
    id: 30,
    chapter: 4,
    title: "终极挑战：反向代理",
    description:
      "公司后端 API 跑在 localhost:3000！配置 Nginx 反向代理，让 /api/* 的请求转发到后端",
    hint: "在配置中添加 location /api/ { proxy_pass http://localhost:3000/; }，然后 nginx -s reload",
    command: "curl -s localhost/api/status",
    objective: "配置反向代理并测试 API 访问",
    knowledgeCards: [
      {
        command: "proxy_pass",
        description: "Nginx 反向代理指令，将请求转发到后端服务",
      },
      {
        command: "proxy_set_header",
        description: "设置转发请求头，常用 Host、X-Real-IP、X-Forwarded-For",
      },
      {
        command: "nginx -s reload",
        description: "重载配置文件，不中断现有连接（生产环境必备）",
      },
      {
        command: "反向代理的作用",
        description: "隐藏后端、负载均衡、SSL 终结、缓存、统一入口",
      },
    ],
    validation: { type: "output_contains", expected: "ok" },
    completed: false,
  },
  // Chapter 5: DevOps 实战
  {
    id: 31,
    chapter: 5,
    title: "环境变量泄漏",
    description:
      "生产环境的数据库密码硬编码在配置文件里！安全团队要求用环境变量替代，设置 DB_PASSWORD 并验证",
    hint: "使用 export DB_PASSWORD=mysecret123 设置环境变量，然后用 env | grep DB_PASSWORD 验证",
    command: "export DB_PASSWORD=mysecret123 && env | grep DB_PASSWORD",
    objective: "设置环境变量 DB_PASSWORD 并验证其存在",
    knowledgeCards: [
      {
        command: "export",
        description: "设置环境变量，当前 shell 及子进程可见",
        flags: [
          { flag: "export VAR=value", meaning: "设置变量并导出为环境变量" },
          { flag: "export -n VAR", meaning: "取消导出（变回普通变量）" },
        ],
      },
      {
        command: "env",
        description: "显示当前所有环境变量",
      },
      {
        command: "echo $VAR",
        description: "输出某个环境变量的值；$ 符号用于引用变量",
      },
    ],
    validation: {
      type: "output_contains",
      expected: "DB_PASSWORD=mysecret123",
    },
    completed: false,
  },
  {
    id: 32,
    chapter: 5,
    title: "编写启动脚本",
    description: "每次部署都要手动执行一堆命令！写一个 shell 脚本一键启动应用",
    hint: '用 cat > start.sh << EOF 创建脚本，内容包含 echo "Starting app..."，然后 chmod +x start.sh',
    command: "chmod +x /home/player/start.sh",
    objective: "创建启动脚本 start.sh 并赋予执行权限",
    knowledgeCards: [
      {
        command: "cat > file << EOF",
        description: "通过 heredoc 方式创建文件，EOF 之间的内容写入文件",
      },
      {
        command: "chmod +x",
        description: "给文件添加可执行权限",
      },
      {
        command: "bash script.sh",
        description:
          "用 bash 执行脚本；如果脚本有 +x 权限，可以直接 ./script.sh",
      },
    ],
    validation: {
      type: "file_permission",
      expected: "/home/player/start.sh:755",
    },
    completed: false,
  },
  {
    id: 33,
    chapter: 5,
    title: "传递参数",
    description:
      "启动脚本需要根据环境（dev/staging/prod）加载不同配置！让脚本接受参数来区分环境",
    hint: "用 $1 获取第一个参数；创建 deploy.sh，内容为根据 $1 输出不同环境的配置路径",
    command: "bash /home/player/deploy.sh prod",
    objective:
      "创建 deploy.sh 脚本，接受 dev/staging/prod 参数并输出对应环境配置",
    knowledgeCards: [
      {
        command: "$1, $2, $3...",
        description: "脚本的位置参数，$1 是第一个参数，$2 是第二个，以此类推",
      },
      {
        command: "$#",
        description: "传递给脚本的参数个数",
      },
      {
        command: "if/else in bash",
        description:
          'if [ "$1" = "prod" ]; then ... ; elif ... ; else ... ; fi',
      },
    ],
    validation: { type: "output_contains", expected: "prod" },
    completed: false,
  },
  {
    id: 34,
    chapter: 5,
    title: "定时备份",
    description: "数据库需要每天凌晨 2 点自动备份！用 crontab 设置定时任务",
    hint: "crontab -e 编辑定时任务，添加：0 2 * * * /home/player/backup.sh",
    command: "crontab -l",
    objective: "配置 crontab 定时任务，每天凌晨 2 点执行备份脚本",
    knowledgeCards: [
      {
        command: "crontab",
        description: "管理用户的定时任务（cron table）",
        flags: [
          { flag: "-e", meaning: "编辑当前用户的 crontab" },
          { flag: "-l", meaning: "列出当前用户的所有定时任务" },
          { flag: "-r", meaning: "删除当前用户的所有定时任务" },
        ],
      },
      {
        command: "cron 表达式",
        description:
          "格式：分 时 日 月 星期；* 表示任意值；0 2 * * * = 每天 2:00",
        flags: [
          { flag: "分 (0-59)", meaning: "第几分钟执行" },
          { flag: "时 (0-23)", meaning: "第几小时执行" },
          { flag: "日 (1-31)", meaning: "每月第几天" },
          { flag: "月 (1-12)", meaning: "第几月" },
          { flag: "星期 (0-6)", meaning: "星期几（0=周日）" },
        ],
      },
    ],
    validation: { type: "output_contains", expected: "backup" },
    completed: false,
  },
  {
    id: 35,
    chapter: 5,
    title: "日志轮转",
    description: "日志文件越来越大，磁盘快满了！配置 logrotate 自动切割归档",
    hint: "创建 /etc/logrotate.d/myapp 配置文件，设置按天轮转、保留 7 天、压缩",
    command: "cat /etc/logrotate.d/myapp",
    objective: "编写 logrotate 配置，自动轮转 /var/log/app.log",
    knowledgeCards: [
      {
        command: "logrotate",
        description: "日志轮转工具，自动切割、压缩、删除旧日志",
      },
      {
        command: "配置文件",
        description: "/etc/logrotate.d/ 下的每个文件定义一个日志轮转规则",
        flags: [
          { flag: "daily", meaning: "每天轮转一次" },
          { flag: "rotate 7", meaning: "保留最近 7 个归档" },
          { flag: "compress", meaning: "用 gzip 压缩归档文件" },
          { flag: "missingok", meaning: "日志文件不存在时不报错" },
        ],
      },
    ],
    validation: { type: "file_exists", expected: "/etc/logrotate.d/myapp" },
    completed: false,
  },
  {
    id: 36,
    chapter: 5,
    title: "SSH 免密登录",
    description: "每次登录服务器都要输密码，太烦了！配置 SSH 密钥实现免密登录",
    hint: "ssh-keygen -t ed25519 生成密钥，然后把公钥写入 ~/.ssh/authorized_keys",
    command: "cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys",
    objective: "生成 SSH 密钥对并配置免密登录",
    knowledgeCards: [
      {
        command: "ssh-keygen",
        description: "生成 SSH 密钥对（公钥 + 私钥）",
        flags: [
          {
            flag: "-t ed25519",
            meaning: "使用 Ed25519 算法（推荐，更安全更快）",
          },
          { flag: "-t rsa", meaning: "使用 RSA 算法（兼容性好）" },
          { flag: "-b 4096", meaning: "指定密钥长度（RSA）" },
        ],
      },
      {
        command: "authorized_keys",
        description: "~/.ssh/authorized_keys 文件存放允许免密登录的公钥列表",
      },
      {
        command: "ssh-copy-id user@host",
        description: "自动将公钥复制到远程服务器的 authorized_keys 中",
      },
    ],
    validation: {
      type: "file_exists",
      expected: "/home/player/.ssh/id_ed25519.pub",
    },
    completed: false,
  },
  {
    id: 37,
    chapter: 5,
    title: "同步文件",
    description: "构建产物需要同步到备份服务器！用 rsync 高效同步文件",
    hint: "rsync -avz /home/player/my-app/dist/ /home/player/backup/",
    command: "rsync -avz /home/player/my-app/dist/ /home/player/backup/",
    objective: "使用 rsync 将构建产物同步到备份目录",
    knowledgeCards: [
      {
        command: "rsync",
        description: "远程/本地文件同步工具，只传输差异部分，效率极高",
        flags: [
          { flag: "-a", meaning: "归档模式（保留权限、时间戳、符号链接等）" },
          { flag: "-v", meaning: "显示详细输出" },
          { flag: "-z", meaning: "传输时压缩数据" },
          { flag: "--delete", meaning: "删除目标目录中源端没有的文件" },
        ],
      },
      {
        command: "scp",
        description: "基于 SSH 的文件复制，简单但不高效（全量复制）",
        flags: [
          { flag: "-r", meaning: "递归复制目录" },
          { flag: "-P 2222", meaning: "指定端口（注意大写 P）" },
        ],
      },
    ],
    validation: { type: "directory_exists", expected: "/home/player/backup" },
    completed: false,
  },
  {
    id: 38,
    chapter: 5,
    title: "进程守护",
    description: "Node.js 服务挂了没人管！用 systemd 让服务崩溃后自动重启",
    hint: "创建 /etc/init.d/myapp 服务脚本，或编写 systemd service 文件",
    command: "cat /home/player/myapp.service",
    objective: "编写 systemd 服务配置文件，实现进程守护",
    knowledgeCards: [
      {
        command: "systemd",
        description: "Linux 系统和服务管理器，几乎所有现代发行版都用它",
      },
      {
        command: "systemctl",
        description: "管理 systemd 服务的命令行工具",
        flags: [
          { flag: "start", meaning: "启动服务" },
          { flag: "stop", meaning: "停止服务" },
          { flag: "restart", meaning: "重启服务" },
          { flag: "status", meaning: "查看服务状态" },
          { flag: "enable", meaning: "设置开机自启" },
        ],
      },
      {
        command: "service 文件",
        description:
          "[Unit] 描述和依赖，[Service] 启动命令和重启策略，[Install] 安装目标",
        flags: [
          { flag: "Restart=always", meaning: "无论什么原因退出都自动重启" },
          { flag: "RestartSec=5", meaning: "重启前等待 5 秒" },
        ],
      },
    ],
    validation: { type: "file_exists", expected: "/home/player/myapp.service" },
    completed: false,
  },
  {
    id: 39,
    chapter: 5,
    title: "磁盘监控告警",
    description: "写一个监控脚本，当磁盘使用率超过 80% 就输出 ALARM 告警信息",
    hint: "df -h 取磁盘使用率，awk 提取百分比，if 判断超过 80 就 echo ALARM",
    command: "bash /home/player/monitor.sh",
    objective: "编写磁盘监控脚本，使用率超 80% 输出告警",
    knowledgeCards: [
      {
        command: "df -h",
        description: "显示磁盘使用情况（人类可读格式）",
      },
      {
        command: "监控脚本思路",
        description:
          "df 取数据 → awk 提取百分比 → 去掉 % 号 → if 判断 → 输出告警",
      },
      {
        command: "实际应用",
        description:
          "生产环境通常配合 cron 定时执行，告警通过邮件/钉钉/企微/Slack 发送",
      },
    ],
    validation: { type: "output_contains", expected: "ALARM" },
    completed: false,
  },
  {
    id: 40,
    chapter: 5,
    title: "CI 流水线",
    description:
      "终极挑战！模拟 GitHub Actions：编写 ci.sh 脚本，一键完成安装依赖 → 运行测试 → 构建打包",
    hint: "用 && 链式执行：npm install && npm test && npm run build，每步成功才继续",
    command: "bash /home/player/ci.sh",
    objective: "编写 CI 脚本，用 && 链式执行安装、测试、构建",
    knowledgeCards: [
      {
        command: "&&（链式执行）",
        description:
          "前一个命令成功（退出码 0）才执行下一个；任何一步失败则停止",
      },
      {
        command: "||（或逻辑）",
        description:
          '前一个命令失败才执行下一个；常用于 fallback：command || echo "failed"',
      },
      {
        command: "CI/CD 流水线",
        description:
          "Continuous Integration / Continuous Delivery：自动构建、测试、部署",
        flags: [
          { flag: "CI", meaning: "持续集成：每次提交自动运行测试" },
          {
            flag: "CD",
            meaning: "持续交付/部署：测试通过后自动部署到生产环境",
          },
        ],
      },
      {
        command: "GitHub Actions",
        description:
          "GitHub 内置的 CI/CD 平台，用 YAML 定义工作流，触发条件有 push、PR、定时等",
      },
    ],
    validation: { type: "output_contains", expected: "Build complete" },
    completed: false,
  },
  // Chapter 6: 脚本编程
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
  // Chapter 7: 网络排查
  {
    id: 51,
    chapter: 7,
    title: "网卡在哪",
    description: "新服务器到手！运维第一步：看看网卡配置和 IP 地址",
    hint: "用 ip addr 查看所有网络接口和 IP 地址信息",
    command: "ip addr",
    objective: "使用 ip addr 查看网络接口和 IP 地址",
    knowledgeCards: [
      {
        command: "ip addr",
        description:
          "显示所有网络接口的 IP 地址、MAC 地址、状态等信息。简写 ip a",
      },
      {
        command: "ifconfig",
        description:
          "老式网络配置命令（net-tools），功能类似 ip addr。新系统推荐用 ip 命令",
      },
      {
        command: "网络接口",
        description:
          "lo 是回环接口（127.0.0.1），eth0 是第一块网卡。每个接口可以有 IPv4（inet）和 IPv6（inet6）地址",
      },
    ],
    validation: { type: "output_contains", expected: "inet" },
    completed: false,
  },
  {
    id: 52,
    chapter: 7,
    title: "谁在监听",
    description:
      "同事说 Nginx 已经启动了，但页面访问不了。检查一下端口是否真的在监听",
    hint: "用 ss -tlnp 查看所有正在监听的 TCP 端口，看看 80 端口是否在列表中",
    command: "ss -tlnp",
    objective: "使用 ss -tlnp 确认 80 端口是否在监听",
    knowledgeCards: [
      {
        command: "ss -tlnp",
        description:
          "显示所有监听中的 TCP 端口。t=TCP，l=listening，n=数字端口，p=显示进程",
      },
      {
        command: "netstat -tlnp",
        description: "老式端口查看命令，功能类似 ss。新系统推荐用 ss（更快）",
      },
      {
        command: "端口状态",
        description:
          "LISTEN 表示服务在等待连接，ESTABLISHED 表示已建立连接。:80 表示监听 80 端口",
      },
    ],
    validation: { type: "output_contains", expected: ":80" },
    completed: false,
  },
  {
    id: 53,
    chapter: 7,
    title: "本地服务测试",
    description: "端口在监听了！现在用 curl 确认 Nginx 是否正常返回 HTML 页面",
    hint: "用 curl localhost 发送 HTTP 请求，看看返回什么内容",
    command: "curl localhost",
    objective: "使用 curl 测试本地 HTTP 服务",
    knowledgeCards: [
      {
        command: "curl URL",
        description: "发送 HTTP 请求并输出响应内容。最基本的 Web 调试工具",
      },
      {
        command: "curl http://127.0.0.1",
        description: "等价于 curl localhost。127.0.0.1 是本机回环地址",
      },
      {
        command: "HTTP 响应",
        description:
          "正常响应包含 HTML 内容（以 <!DOCTYPE html> 或 <html> 开头），表示 Web 服务正常",
      },
    ],
    validation: { type: "output_contains", expected: "html" },
    completed: false,
  },
  {
    id: 54,
    chapter: 7,
    title: "响应头诊断",
    description:
      "页面行为异常，可能是缓存问题也可能是服务器配置错误。先看看 HTTP 响应头",
    hint: "用 curl -I localhost 只看响应头（HEAD 请求），重点看状态码和 Server 字段",
    command: "curl -I localhost",
    objective: "使用 curl -I 查看 HTTP 响应头和状态码",
    knowledgeCards: [
      {
        command: "curl -I URL",
        description:
          "发送 HEAD 请求，只返回响应头不返回 body。用于快速检查状态码和服务器信息",
      },
      {
        command: "HTTP 状态码",
        description:
          "200=成功，301/302=重定向，404=未找到，500=服务器错误。状态码是排查 HTTP 问题的第一线索",
      },
      {
        command: 'curl -w "%{http_code}"',
        description: "自定义输出格式，只打印 HTTP 状态码。适合脚本中使用",
      },
    ],
    validation: { type: "output_contains", expected: "200" },
    completed: false,
  },
  {
    id: 55,
    chapter: 7,
    title: "详细请求追踪",
    description:
      "API 调用有时超时有时正常。用 curl -v 看看完整的 HTTP 交互过程，包括 DNS 解析、连接建立、请求头和响应头",
    hint: "用 curl -v localhost 查看完整的请求/响应过程，* 开头的是连接信息，> 是请求头，< 是响应头",
    command: "curl -v localhost",
    objective: "使用 curl -v 查看完整 HTTP 请求响应过程",
    knowledgeCards: [
      {
        command: "curl -v URL",
        description:
          "verbose 模式，输出完整的 HTTP 交互过程。* 是连接信息，> 是请求头，< 是响应头",
      },
      {
        command: "curl -vvv URL",
        description: "更详细的调试输出，包含 SSL/TLS 握手细节",
      },
      {
        command: "排查思路",
        description:
          "先看 DNS 解析是否正常 → 再看 TCP 连接是否建立 → 再看 HTTP 状态码 → 最后看响应内容",
      },
    ],
    validation: { type: "output_contains", expected: "HTTP/" },
    completed: false,
  },
  {
    id: 56,
    chapter: 7,
    title: "DNS 解析排查",
    description: "用户反馈网站打不开！ping 也不通。先查一下 DNS 解析是否正常",
    hint: "用 nslookup localhost 查看域名解析结果，或者用 getent hosts localhost 查看 hosts 解析",
    command: "nslookup localhost",
    objective: "使用 DNS 查询工具排查域名解析问题",
    knowledgeCards: [
      {
        command: "nslookup 域名",
        description:
          "查询 DNS 解析记录，查看域名对应的 IP 地址。最常用的 DNS 诊断工具",
      },
      {
        command: "getent hosts 域名",
        description:
          "查询系统名称解析（包括 /etc/hosts 和 DNS），比 nslookup 更贴近实际解析结果",
      },
      {
        command: "DNS 排查流程",
        description:
          "1) 检查 /etc/hosts 是否有硬编码 2) 用 nslookup 查 DNS 3) 对比期望 IP 4) 检查 /etc/resolv.conf 的 DNS 服务器配置",
      },
    ],
    validation: { type: "output_contains", expected: "127.0.0.1" },
    completed: false,
  },
  {
    id: 57,
    chapter: 7,
    title: "端口连通性",
    description:
      "需要连接远程数据库，但不确定端口是否可达。用 nc 测试一下 TCP 连通性",
    hint: "用 nc -zv localhost 80 测试 80 端口是否可达。z=扫描模式不发送数据，v=详细输出",
    command: "nc -zv localhost 80",
    objective: "使用 nc 测试 TCP 端口连通性",
    knowledgeCards: [
      {
        command: "nc -zv HOST PORT",
        description:
          '测试 TCP 端口连通性。z=零 I/O 模式（只测连接不发数据），v=显示结果。成功输出 "succeeded"，失败输出 "refused"',
      },
      {
        command: "nc -zv HOST 1-1000",
        description: "端口范围扫描。可以快速发现目标主机上哪些端口开放",
      },
      {
        command: "连通性排查",
        description:
          "端口不通的常见原因：1) 服务没启动 2) 防火墙阻止 3) 监听在 127.0.0.1 而非 0.0.0.0 4) 网络不通",
      },
    ],
    validation: { type: "output_contains", expected: "succeeded" },
    completed: false,
  },
  {
    id: 58,
    chapter: 7,
    title: "路由走向",
    description: "两台机器之间网络不通。查看路由表，看看数据包会走哪条路",
    hint: "用 ip route 查看路由表，default 开头的是默认网关，也是出口路由",
    command: "ip route",
    objective: "使用 ip route 查看系统路由表",
    knowledgeCards: [
      {
        command: "ip route",
        description:
          "显示路由表。default via GATEWAY 是默认路由，所有不匹配的流量走网关",
      },
      {
        command: "route -n",
        description:
          "老式路由查看命令（net-tools），-n 用数字显示地址不解析域名",
      },
      {
        command: "路由排障",
        description:
          "1) 检查是否有 default 路由 2) 目标 IP 匹配哪条路由 3) via 后面的网关是否可达 4) dev 指定的网卡是否正常",
      },
    ],
    validation: { type: "output_contains", expected: "default" },
    completed: false,
  },
  {
    id: 59,
    chapter: 7,
    title: "连接数统计",
    description: "服务器响应越来越慢，怀疑是连接数太多。统计一下 TCP 连接状态",
    hint: "用 ss -s 查看连接统计摘要，重点关注 estab（已建立连接）的数量",
    command: "ss -s",
    objective: "使用 ss -s 统计 TCP 连接状态",
    knowledgeCards: [
      {
        command: "ss -s",
        description:
          "显示 socket 统计摘要。包括 TCP/UDP/RAW socket 数量和各状态连接数",
      },
      {
        command: "ss -tan",
        description:
          "显示所有 TCP 连接详情。t=TCP，a=all（包括 LISTEN），n=数字格式",
      },
      {
        command: "TCP 状态",
        description:
          "ESTAB=已建立，TIME-WAIT=等待关闭，CLOSE-WAIT=等待本地关闭。大量 TIME-WAIT 说明短连接过多",
      },
    ],
    validation: { type: "output_contains", expected: "TCP" },
    completed: false,
  },
  {
    id: 60,
    chapter: 7,
    title: "综合排查",
    description:
      "终极挑战！Web 服务不可用，用户反馈页面打不开。从网络接口 → 端口检查 → 启动服务 → 验证访问，完整排查并修复故障",
    hint: "先用 ss 检查端口 → 发现 80 没监听 → 启动 nginx → 用 curl 验证服务正常",
    command: "curl localhost",
    objective: "综合运用网络排查工具，完成从发现故障到修复的全流程",
    knowledgeCards: [
      {
        command: "排查方法论",
        description:
          "网络排查黄金法则：从底层到顶层。物理层 → 数据链路 → 网络（IP/路由）→ 传输（TCP/端口）→ 应用（HTTP/DNS）",
      },
      {
        command: "故障排查清单",
        description:
          "1) ip addr 查网卡 2) ip route 查路由 3) ss 查端口 4) nc 测连通 5) curl 测 HTTP 6) nslookup 查 DNS",
      },
      {
        command: 'curl -o /dev/null -s -w "%{http_code}"',
        description:
          "静默请求只输出状态码，适合监控脚本。可扩展输出 time_total、size_download 等指标",
      },
    ],
    validation: { type: "output_contains", expected: "html" },
    completed: false,
  },
];

function App() {
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [levels, setLevels] = useState<LevelType[]>(LEVELS);
  const [sessionId, setSessionId] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const { isDark } = useTheme();
  const { user, logout } = useAuth();

  // Load progress from server on mount
  useEffect(() => {
    if (user) {
      userApi
        .getProgress()
        .then((res) => {
          const { currentLevel: cl, completedLevels } = res.data;
          setCurrentLevel(cl);
          setLevels((prev) =>
            prev.map((level) => ({
              ...level,
              completed: completedLevels.includes(level.id),
            })),
          );
          setProgressLoaded(true);
        })
        .catch(() => {
          // Fallback to localStorage if server unavailable
          const saved = localStorage.getItem("linux-learning-current-level");
          if (saved) setCurrentLevel(parseInt(saved, 10));
          const savedProgress = localStorage.getItem("linux-learning-progress");
          if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            setLevels((prev) =>
              prev.map((level) => ({
                ...level,
                completed:
                  progress.completedLevels?.includes(level.id) || false,
              })),
            );
          }
          setProgressLoaded(true);
        });
    } else {
      setProgressLoaded(true);
    }
  }, [user]);

  // Save progress to server when level changes (only after initial load)
  useEffect(() => {
    if (!progressLoaded) return;
    if (user) {
      const completedLevels = levels
        .filter((l) => l.completed)
        .map((l) => l.id);
      userApi.updateProgress(currentLevel, completedLevels).catch(() => {});
    } else {
      localStorage.setItem(
        "linux-learning-current-level",
        String(currentLevel),
      );
    }
  }, [currentLevel, user]);

  useEffect(() => {
    connectSocket();

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("session:created", (id: string) => {
      setSessionId(id);
    });

    socket.on("level:completed", (data: { levelId: number }) => {
      const completedLevelId = data.levelId;
      const nextLevel = completedLevelId + 1;
      setLevelCompleted(true);
      setCurrentLevel(nextLevel);
      setLevels((prev) => {
        const updated = prev.map((level) =>
          level.id === completedLevelId ? { ...level, completed: true } : level,
        );
        const completedLevels = updated
          .filter((l) => l.completed)
          .map((l) => l.id);
        // Save to server or localStorage
        const token = localStorage.getItem("linux-learning-token");
        if (token) {
          userApi.updateProgress(nextLevel, completedLevels).catch(() => {});
        } else {
          localStorage.setItem(
            "linux-learning-progress",
            JSON.stringify({ completedLevels }),
          );
          localStorage.setItem(
            "linux-learning-current-level",
            String(nextLevel),
          );
        }
        return updated;
      });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("session:created");
      socket.off("level:completed");
    };
  }, []);

  useEffect(() => {
    if (connected && currentLevel) {
      socket.emit("session:create", { levelId: currentLevel });
    }
  }, [connected, currentLevel]);

  const handleNextLevel = () => {
    if (currentLevel < levels.length) {
      setLevelCompleted(false);
      setCurrentLevel((prev) => prev + 1);
    }
  };

  const handleSelectLevel = (levelId: number) => {
    const level = levels.find((l) => l.id === levelId);
    if (
      level &&
      (level.id === 1 || levels.find((l) => l.id === levelId - 1)?.completed)
    ) {
      setLevelCompleted(false);
      setCurrentLevel(levelId);
    }
  };

  const activeLevel = levels.find((l) => l.id === currentLevel);
  const completedCount = levels.filter((l) => l.completed).length;

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden ${isDark ? "bg-slate-900" : "bg-slate-50"}`}
    >
      {/* Header - Fixed */}
      <header
        className={`shrink-0 z-50 border-b backdrop-blur-xl ${
          isDark
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white/80 border-slate-200"
        }`}
      >
        <div className="px-4 sm:px-6 py-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDark
                    ? "bg-gradient-to-br from-green-500 to-emerald-600"
                    : "bg-gradient-to-br from-green-600 to-emerald-700"
                } shadow-lg shadow-green-500/25`}
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1
                className={`text-base font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}
              >
                Linux 命令行学习平台
              </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Progress badge */}
              <div
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  isDark
                    ? "bg-slate-800 text-slate-300"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  {completedCount}/{levels.length}
                </span>
              </div>

              {/* Connection Status */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${
                  connected
                    ? isDark
                      ? "bg-green-500/10 text-green-400 ring-1 ring-green-500/20"
                      : "bg-green-50 text-green-600 ring-1 ring-green-200"
                    : isDark
                      ? "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
                      : "bg-red-50 text-red-600 ring-1 ring-red-200"
                }`}
              >
                <span className={`relative flex h-2 w-2`}>
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      connected ? "bg-green-400" : "bg-red-400"
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      connected ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                </span>
                <span className="hidden sm:inline">
                  {connected ? "已连接" : "离线"}
                </span>
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Avatar & Logout */}
              {user && (
                <div className="flex items-center gap-2">
                  <AvatarPicker currentAvatar={user.avatar} />
                  <button
                    onClick={logout}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isDark
                        ? "bg-slate-800 text-slate-300 hover:bg-red-500/20 hover:text-red-400"
                        : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500"
                    }`}
                    title="退出登录"
                  >
                    退出
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Scrollable */}
        <aside
          className={`w-full lg:w-[400px] flex-shrink-0 flex flex-col ${
            isDark ? "bg-slate-900/50" : "bg-slate-50"
          } ${isDark ? "lg:border-r lg:border-slate-800" : "lg:border-r lg:border-slate-200"}`}
        >
          <div className="p-4 sm:p-6 flex-1 min-h-0 flex flex-col gap-4">
            <div className="h-[380px] flex-shrink-0">
              <Progress
                levels={levels}
                currentLevel={currentLevel}
                onSelectLevel={handleSelectLevel}
              />
            </div>
            {activeLevel && (
              <div className="flex-1 min-h-0">
                <Level
                  level={activeLevel}
                  completed={levelCompleted}
                  onNextLevel={handleNextLevel}
                  hasNextLevel={currentLevel < levels.length}
                />
              </div>
            )}
          </div>
        </aside>

        {/* Right Panel - Fixed Terminal */}
        <main className="hidden lg:flex flex-1 flex-col min-w-0 p-4 sm:p-6">
          <div
            className={`flex-1 rounded-2xl overflow-hidden border shadow-2xl flex flex-col ${
              isDark
                ? "bg-slate-800/50 border-slate-700/50 shadow-black/20"
                : "bg-white border-slate-200 shadow-slate-200/50"
            }`}
          >
            {/* Terminal Header */}
            <div
              className={`shrink-0 px-4 py-3 flex items-center gap-3 ${
                isDark
                  ? "bg-slate-800/80 border-b border-slate-700/50"
                  : "bg-slate-100 border-b border-slate-200"
              }`}
            >
              {/* Traffic lights */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer"></span>
                <span className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer"></span>
              </div>
              <div className="flex-1 text-center">
                <span
                  className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  player@linux:~
                </span>
              </div>
              <div className="w-16"></div>
            </div>

            {/* Terminal Content */}
            <div className="flex-1 min-h-0">
              <Terminal sessionId={sessionId} levelId={currentLevel} />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Terminal Toggle */}
      <div className="lg:hidden shrink-0">
        <button
          className={`w-full py-3 text-sm font-medium flex items-center justify-center gap-2 ${
            isDark
              ? "bg-slate-800 text-white border-t border-slate-700"
              : "bg-white text-slate-900 border-t border-slate-200"
          }`}
          onClick={() => {
            // 简单滚动到终端区域或显示模态框
            alert("移动端终端暂未完全适配，请使用桌面端获得最佳体验");
          }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          打开终端
        </button>
      </div>
    </div>
  );
}

export default App;
