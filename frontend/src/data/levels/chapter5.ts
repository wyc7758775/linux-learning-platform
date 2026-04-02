import type { Level } from "./types";

// Chapter 5: DevOps 实战 (Level 31-40)
export const chapter5Levels: Level[] = [
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
];
