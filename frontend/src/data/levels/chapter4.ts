import type { Level } from "./types";

// Chapter 4: 部署上线 (Level 21-30)
export const chapter4Levels: Level[] = [
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
];
