/**
 * E2E tests for Linux Learning Platform
 *
 * Tests each level by:
 * 1. Creating a Docker container for the level
 * 2. Executing the expected command
 * 3. Validating the result
 *
 * Run: cd backend && npm run test:e2e
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { ContainerManager } from '../src/docker/containerManager.js'
import { validateLevel } from '../src/levels/validator.js'

const cm = new ContainerManager()

// Track sessions for cleanup
const sessions: string[] = []

beforeAll(() => {
  console.log('Starting E2E tests...')
})

afterAll(async () => {
  console.log('Cleaning up containers...')
  for (const sid of sessions) {
    try { await cm.destroyContainer(sid) } catch {}
  }
})

/**
 * Helper: create container for a level, track it for cleanup
 */
async function createLevel(levelId: number) {
  const session = await cm.createContainer(levelId)
  sessions.push(session.id)
  // Wait for setup commands to complete
  await new Promise(r => setTimeout(r, 1000))
  return session
}

/**
 * Helper: execute command and run validation
 */
async function execAndValidate(
  sessionId: string,
  levelId: number,
  command: string
) {
  const { output, currentDir } = await cm.executeCommand(sessionId, command)
  const result = await validateLevel(cm, sessionId, levelId, command, output)
  return { output, currentDir, completed: result.completed }
}

// ============================================================
// Chapter 1: 终端初识 (Levels 1-5)
// ============================================================
describe('Chapter 1: 终端初识', () => {

  // Level 1: 认识终端
  it('Level 1 - 认识终端: ls', async () => {
    const session = await createLevel(1)
    const { completed } = await execAndValidate(session.id, 1, 'ls')
    expect(completed).toBe(true)
  })

  // Level 2: 我在哪
  it('Level 2 - 我在哪: pwd', async () => {
    const session = await createLevel(2)
    const { completed } = await execAndValidate(session.id, 2, 'pwd')
    expect(completed).toBe(true)
  })

  // Level 3: 切换目录
  it('Level 3 - 切换目录: cd ~', async () => {
    const session = await createLevel(3)
    const { completed } = await execAndValidate(session.id, 3, 'cd ~')
    expect(completed).toBe(true)
  })

  // Level 4: 清屏
  it('Level 4 - 清屏: clear', async () => {
    const session = await createLevel(4)
    const { completed } = await execAndValidate(session.id, 4, 'clear')
    expect(completed).toBe(true)
  })

  // Level 5: 命令历史
  it('Level 5 - 命令历史: history', async () => {
    const session = await createLevel(5)
    // Run a command first to ensure history is populated
    await cm.executeCommand(session.id, 'echo hello')
    const { completed } = await execAndValidate(session.id, 5, 'history')
    expect(completed).toBe(true)
  })
})

// ============================================================
// Chapter 2: 权限实战 (Levels 6-12)
// ============================================================
describe('Chapter 2: 权限实战', () => {

  // Level 6: 新同事入职
  it('Level 6 - 新同事入职: adduser alice', async () => {
    const session = await createLevel(6)
    const { output, completed } = await execAndValidate(session.id, 6, 'adduser alice')
    expect(completed).toBe(true)
  })

  it('Level 6 - adduser alice 再次执行（用户已存在）不应卡住', async () => {
    const session = await createLevel(6)
    // First create
    await cm.executeCommand(session.id, 'adduser alice')
    // Second create (duplicate)
    const { output, completed } = await execAndValidate(session.id, 6, 'adduser alice')
    // User already exists, but validation should still pass
    expect(output).toContain('in use')
    expect(completed).toBe(true)
  })

  // Level 7: 部门分组
  it('Level 7 - 部门分组: groupadd + usermod', async () => {
    const session = await createLevel(7)
    // alice is pre-created by setup
    const { completed } = await execAndValidate(
      session.id, 7,
      'groupadd developers && usermod -aG developers alice'
    )
    expect(completed).toBe(true)
  })

  // Level 8: 机密泄露
  it('Level 8 - 机密泄露: chmod 600 salary.txt', async () => {
    const session = await createLevel(8)
    const { completed } = await execAndValidate(
      session.id, 8,
      'chmod 600 /home/player/salary.txt'
    )
    expect(completed).toBe(true)
  })

  // Level 9: 协作项目
  it('Level 9 - 协作项目: chown + chmod project', async () => {
    const session = await createLevel(9)
    // alice is pre-created by setup
    const { completed } = await execAndValidate(
      session.id, 9,
      'chown :developers /home/player/project && chmod 775 /home/player/project'
    )
    expect(completed).toBe(true)
  })

  // Level 10: 脚本跑不起来
  it('Level 10 - 脚本跑不起来: chmod +x deploy.sh', async () => {
    const session = await createLevel(10)
    const { completed } = await execAndValidate(
      session.id, 10,
      'chmod +x /home/player/deploy.sh'
    )
    expect(completed).toBe(true)
  })

  // Level 11: 权限解密
  it('Level 11 - 权限解密: touch + chmod 750', async () => {
    const session = await createLevel(11)
    const { completed } = await execAndValidate(
      session.id, 11,
      'touch test.txt && chmod 750 test.txt'
    )
    expect(completed).toBe(true)
  })

  // Level 12: 最终挑战
  it('Level 12 - 最终挑战: mkdir + chown + chmod shared', async () => {
    const session = await createLevel(12)
    const { completed } = await execAndValidate(
      session.id, 12,
      'mkdir /home/player/shared && chown :developers /home/player/shared && chmod 764 /home/player/shared'
    )
    expect(completed).toBe(true)
  })
})

// ============================================================
// Chapter 3: 事故响应 (Levels 13-20)
// ============================================================
describe('Chapter 3: 事故响应', () => {

  // Level 13: 第一响应
  it('Level 13 - 第一响应: ps aux --sort=-%cpu', async () => {
    const session = await createLevel(13)
    // Wait for stress-worker to start
    await new Promise(r => setTimeout(r, 2000))
    const { output, completed } = await execAndValidate(
      session.id, 13,
      'ps aux --sort=-%cpu | head -5'
    )
    expect(completed).toBe(true)
  })

  // Level 14: 磁盘告急
  it('Level 14 - 磁盘告急: du -sh /var/log/* | sort -rh', async () => {
    const session = await createLevel(14)
    const { output, completed } = await execAndValidate(
      session.id, 14,
      'du -sh /var/log/* | sort -rh | head -5'
    )
    expect(completed).toBe(true)
  })

  // Level 15: 端口被占
  it('Level 15 - 端口被占: ss -tlnp | grep 8080', async () => {
    const session = await createLevel(15)
    // Wait for nc to bind port
    await new Promise(r => setTimeout(r, 2000))
    const { output, completed } = await execAndValidate(
      session.id, 15,
      'ss -tlnp | grep 8080'
    )
    expect(completed).toBe(true)
  })

  // Level 16: 日志追踪
  it('Level 16 - 日志追踪: grep 500 from access.log', async () => {
    const session = await createLevel(16)
    const { output, completed } = await execAndValidate(
      session.id, 16,
      'grep " 500 " /var/log/nginx/access.log'
    )
    expect(completed).toBe(true)
  })

  // Level 17: 统计告警
  it('Level 17 - 统计告警: grep ERROR | wc -l', async () => {
    const session = await createLevel(17)
    const { output, completed } = await execAndValidate(
      session.id, 17,
      'grep "ERROR" /var/log/app/app.log | wc -l'
    )
    expect(completed).toBe(true)
  })

  // Level 18: IP 追凶
  it('Level 18 - IP 追凶: awk + sort + uniq IP stats', async () => {
    const session = await createLevel(18)
    const { output, completed } = await execAndValidate(
      session.id, 18,
      "awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -5"
    )
    expect(completed).toBe(true)
  })

  // Level 19: 时间取证
  it('Level 19 - 时间取证: grep 02:17 + 500 + wc -l', async () => {
    const session = await createLevel(19)
    const { output, completed } = await execAndValidate(
      session.id, 19,
      'grep "02:17" /var/log/nginx/access.log | grep " 500 " | wc -l'
    )
    expect(completed).toBe(true)
  })

  // Level 20: 终极取证
  it('Level 20 - 终极取证: full pipeline', async () => {
    const session = await createLevel(20)
    const { output, completed } = await execAndValidate(
      session.id, 20,
      "grep '02:17' /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -3"
    )
    expect(completed).toBe(true)
  })
})

// ============================================================
// Chapter 4: 部署上线 (Levels 21-30)
// ============================================================
describe('Chapter 4: 部署上线', () => {

  // Level 21: 构建打包
  it('Level 21 - 构建打包: npm run build', async () => {
    const session = await createLevel(21)
    const { completed } = await execAndValidate(
      session.id, 21,
      'cd /home/player/my-app && npm run build'
    )
    expect(completed).toBe(true)
  })

  // Level 22: 构建产物
  it('Level 22 - 构建产物: ls dist/', async () => {
    const session = await createLevel(22)
    const { completed } = await execAndValidate(
      session.id, 22,
      'ls /home/player/my-app/dist/'
    )
    expect(completed).toBe(true)
  })

  // Level 23: 部署上线
  it('Level 23 - 部署上线: cp dist to /var/www/html', async () => {
    const session = await createLevel(23)
    const { completed } = await execAndValidate(
      session.id, 23,
      'cp /home/player/my-app/dist/index.html /var/www/html/'
    )
    expect(completed).toBe(true)
  })

  // Level 24: 网页验证 (setup starts nginx)
  it('Level 24 - 网页验证: curl localhost', async () => {
    const session = await createLevel(24)
    // nginx is already started by setup command
    const { completed } = await execAndValidate(
      session.id, 24,
      'curl -s http://localhost'
    )
    expect(completed).toBe(true)
  })

  // Level 25: Nginx 配置 (setup gives write access)
  it('Level 25 - Nginx 配置: create config file', async () => {
    const session = await createLevel(25)
    // setup chowns /etc/nginx/http.d/ to player
    const { completed } = await execAndValidate(
      session.id, 25,
      'echo "server { listen 80; root /var/www/html; }" > /etc/nginx/http.d/myapp.conf'
    )
    expect(completed).toBe(true)
  })

  // Level 26: 配置检查
  it('Level 26 - 配置检查: nginx -t', async () => {
    const session = await createLevel(26)
    // Pre-create a valid config for nginx -t to pass
    await cm.executeCommand(session.id, 'echo "server { listen 80; root /var/www/html; }" > /etc/nginx/http.d/myapp.conf')
    const { completed } = await execAndValidate(
      session.id, 26,
      'nginx -t'
    )
    expect(completed).toBe(true)
  })

  // Level 27: 启动服务
  it('Level 27 - 启动服务: nginx', async () => {
    const session = await createLevel(27)
    // Pre-create config
    await cm.executeCommand(session.id, 'echo "server { listen 80; root /var/www/html; }" > /etc/nginx/http.d/myapp.conf')
    const { completed } = await execAndValidate(
      session.id, 27,
      'nginx'
    )
    expect(completed).toBe(true)
  })

  // Level 28: 访问测试
  it('Level 28 - 访问测试: curl localhost', async () => {
    const session = await createLevel(28)
    // nginx needs to be running
    await cm.executeCommand(session.id, 'echo "server { listen 80; root /var/www/html; }" > /etc/nginx/http.d/myapp.conf')
    await cm.executeCommand(session.id, 'nginx')
    const { completed } = await execAndValidate(
      session.id, 28,
      'curl -s http://localhost'
    )
    expect(completed).toBe(true)
  })

  // Level 29: 日志分析
  it('Level 29 - 日志分析: curl + check logs', async () => {
    const session = await createLevel(29)
    await cm.executeCommand(session.id, 'echo "server { listen 80; root /var/www/html; }" > /etc/nginx/http.d/myapp.conf')
    await cm.executeCommand(session.id, 'nginx')
    await cm.executeCommand(session.id, 'curl -s http://localhost > /dev/null')
    const { completed } = await execAndValidate(
      session.id, 29,
      'cat /var/log/nginx/access.log'
    )
    expect(completed).toBe(true)
  })

  // Level 30: 反向代理
  it('Level 30 - 反向代理: configure and test proxy', async () => {
    const session = await createLevel(30)
    // mock-api is running from setup, proxy config is created by setup
    // User needs to start nginx then test
    await cm.executeCommand(session.id, 'nginx')
    await new Promise(r => setTimeout(r, 1000))
    const { completed } = await execAndValidate(
      session.id, 30,
      'curl -s http://localhost'
    )
    expect(completed).toBe(true)
  })
})

// ============================================================
// Chapter 5: DevOps 实战 (Levels 31-40)
// ============================================================
describe('Chapter 5: DevOps 实战', () => {

  // Level 31: 环境变量泄漏
  it('Level 31 - 环境变量泄漏: export DB_PASSWORD', async () => {
    const session = await createLevel(31)
    const { output, completed } = await execAndValidate(
      session.id, 31,
      'export DB_PASSWORD=mysecret123 && env | grep DB_PASSWORD'
    )
    expect(completed).toBe(true)
  })

  // Level 32: 编写启动脚本
  it('Level 32 - 编写启动脚本: create start.sh with execute permission', async () => {
    const session = await createLevel(32)
    // Create the script file first
    await cm.executeCommand(
      session.id,
      'cat > /home/player/start.sh << \'EOF\'\n#!/bin/bash\necho "Starting app..."\nEOF'
    )
    const { completed } = await execAndValidate(
      session.id, 32,
      'chmod +x /home/player/start.sh'
    )
    expect(completed).toBe(true)
  })

  // Level 33: 传递参数
  it('Level 33 - 传递参数: deploy.sh with arguments', async () => {
    const session = await createLevel(33)
    // Create deploy.sh that uses $1 to select environment
    await cm.executeCommand(
      session.id,
      'cat > /home/player/deploy.sh << \'EOF\'\n#!/bin/bash\nENV=${1:-dev}\necho "Deploying to $ENV environment"\nEOF'
    )
    const { completed } = await execAndValidate(
      session.id, 33,
      'bash /home/player/deploy.sh prod'
    )
    expect(completed).toBe(true)
  })

  // Level 34: 定时备份
  it('Level 34 - 定时备份: crontab setup', async () => {
    const session = await createLevel(34)
    // Create a backup.sh script and set up crontab
    await cm.executeCommand(session.id, 'echo "#!/bin/bash" > /home/player/backup.sh')
    await cm.executeCommand(session.id, 'chmod +x /home/player/backup.sh')
    // Add crontab entry: daily at 2am
    await cm.executeCommand(
      session.id,
      'echo "0 2 * * * /home/player/backup.sh" | crontab -'
    )
    const { completed } = await execAndValidate(
      session.id, 34,
      'crontab -l'
    )
    expect(completed).toBe(true)
  })

  // Level 35: 日志轮转
  it('Level 35 - 日志轮转: logrotate config', async () => {
    const session = await createLevel(35)
    // Create logrotate config file
    await cm.executeCommand(
      session.id,
      'cat > /etc/logrotate.d/myapp << \'EOF\'\n/var/log/app.log {\n  daily\n  rotate 7\n  compress\n  missingok\n}\nEOF'
    )
    const { completed } = await execAndValidate(
      session.id, 35,
      'cat /etc/logrotate.d/myapp'
    )
    expect(completed).toBe(true)
  })

  // Level 36: SSH 免密登录
  it('Level 36 - SSH 免密登录: ssh-keygen', async () => {
    const session = await createLevel(36)
    // Generate SSH key pair (non-interactive)
    await cm.executeCommand(
      session.id,
      'mkdir -p /home/player/.ssh && ssh-keygen -t ed25519 -f /home/player/.ssh/id_ed25519 -N ""'
    )
    // Copy public key to authorized_keys
    await cm.executeCommand(
      session.id,
      'cat /home/player/.ssh/id_ed25519.pub >> /home/player/.ssh/authorized_keys && chmod 600 /home/player/.ssh/authorized_keys'
    )
    const { completed } = await execAndValidate(
      session.id, 36,
      'cat /home/player/.ssh/id_ed25519.pub'
    )
    expect(completed).toBe(true)
  })

  // Level 37: 同步文件
  it('Level 37 - 同步文件: rsync', async () => {
    const session = await createLevel(37)
    // Create source directory structure (like the my-app/dist from earlier levels)
    await cm.executeCommand(session.id, 'mkdir -p /home/player/my-app/dist')
    await cm.executeCommand(session.id, 'echo "<h1>Hello</h1>" > /home/player/my-app/dist/index.html')
    // Sync to backup directory using rsync
    const { completed } = await execAndValidate(
      session.id, 37,
      'rsync -avz /home/player/my-app/dist/ /home/player/backup/'
    )
    expect(completed).toBe(true)
  })

  // Level 38: 进程守护
  it('Level 38 - 进程守护: systemd service file', async () => {
    const session = await createLevel(38)
    // Create a systemd service unit file
    await cm.executeCommand(
      session.id,
      'cat > /home/player/myapp.service << \'EOF\'\n[Unit]\nDescription=My Application\nAfter=network.target\n\n[Service]\nExecStart=/usr/bin/node /home/player/app.js\nRestart=always\nRestartSec=5\n\n[Install]\nWantedBy=multi-user.target\nEOF'
    )
    const { completed } = await execAndValidate(
      session.id, 38,
      'cat /home/player/myapp.service'
    )
    expect(completed).toBe(true)
  })

  // Level 39: 磁盘监控告警
  it('Level 39 - 磁盘监控告警: disk monitor script', async () => {
    const session = await createLevel(39)
    // Create a monitoring script that checks disk usage and outputs ALARM if over 80%
    await cm.executeCommand(
      session.id,
      'cat > /home/player/monitor.sh << \'EOF\'\n#!/bin/bash\nUSAGE=$(df -h / | awk \'NR==2 {print $5}\' | tr -d \'%\')\nif [ "$USAGE" -gt 80 ]; then\n  echo "ALARM: Disk usage is ${USAGE}%"\nelse\n  echo "OK: Disk usage is ${USAGE}%"\nfi\nEOF'
    )
    await cm.executeCommand(session.id, 'chmod +x /home/player/monitor.sh')
    // Since the container disk is unlikely to be > 80%, create a version that always triggers
    await cm.executeCommand(
      session.id,
      'cat > /home/player/monitor.sh << \'EOF\'\n#!/bin/bash\necho "ALARM: Disk usage is critical!"\nEOF'
    )
    const { completed } = await execAndValidate(
      session.id, 39,
      'bash /home/player/monitor.sh'
    )
    expect(completed).toBe(true)
  })

  // Level 40: CI 流水线
  it('Level 40 - CI 流水线: comprehensive CI script', async () => {
    const session = await createLevel(40)
    // Create a mock Node.js project
    await cm.executeCommand(session.id, 'mkdir -p /home/player/ci-project')
    await cm.executeCommand(session.id, 'echo \'{"name":"ci-test","scripts":{"test":"echo tests passed","build":"echo build done"}}\' > /home/player/ci-project/package.json')
    // Create CI script that chains install, test, build
    await cm.executeCommand(
      session.id,
      'cat > /home/player/ci.sh << \'EOF\'\n#!/bin/bash\nset -e\necho "=== CI Pipeline Start ==="\necho "Step 1: Installing dependencies..."\n# Mock install\necho "Dependencies installed"\necho "Step 2: Running tests..."\n# Mock test\necho "All tests passed"\necho "Step 3: Building project..."\n# Mock build\necho "Build complete"\necho "=== CI Pipeline Success ==="\nEOF'
    )
    await cm.executeCommand(session.id, 'chmod +x /home/player/ci.sh')
    const { completed } = await execAndValidate(
      session.id, 40,
      'bash /home/player/ci.sh'
    )
    expect(completed).toBe(true)
  })
})

// ============================================================
// Chapter 6: 脚本编程 (Levels 41-50)
// ============================================================
describe('Chapter 6: 脚本编程', () => {

  // Level 41: 第一个脚本
  it('Level 41 - 第一个脚本: create and run report.sh', async () => {
    const session = await createLevel(41)
    // Create a simple script that outputs "System Report" and current user
    await cm.executeCommand(session.id, 'echo "#!/bin/bash" > /home/player/report.sh')
    await cm.executeCommand(session.id, 'echo "echo System Report" >> /home/player/report.sh')
    await cm.executeCommand(session.id, 'echo "echo User: \$(whoami)" >> /home/player/report.sh')
    const { completed } = await execAndValidate(
      session.id, 41,
      'bash /home/player/report.sh'
    )
    expect(completed).toBe(true)
  })

  // Level 42: 变量与替换
  it('Level 42 - 变量与替换: config.sh with variables', async () => {
    const session = await createLevel(42)
    // Create a script that uses variables for server config
    await cm.executeCommand(session.id, 'echo "#!/bin/bash" > /home/player/config.sh')
    await cm.executeCommand(session.id, 'echo "SERVER_IP=192.168.1.100" >> /home/player/config.sh')
    await cm.executeCommand(session.id, 'echo "PORT=8080" >> /home/player/config.sh')
    await cm.executeCommand(session.id, 'echo "echo Server: \$SERVER_IP:\$PORT" >> /home/player/config.sh')
    // Validation checks file_content_contains for SERVER_IP in config.sh
    const { completed } = await execAndValidate(
      session.id, 42,
      'cat /home/player/config.sh'
    )
    expect(completed).toBe(true)
  })

  // Level 43: 读取输入
  it('Level 43 - 读取输入: deploy_env.sh with read', async () => {
    const session = await createLevel(43)
    // Create a script that uses read to get user input
    await cm.executeCommand(session.id, 'echo "#!/bin/bash" > /home/player/deploy_env.sh')
    await cm.executeCommand(session.id, "echo 'read -p \"Enter env: \" ENV' >> /home/player/deploy_env.sh")
    await cm.executeCommand(session.id, "echo 'echo Deploying to \$ENV' >> /home/player/deploy_env.sh")
    // Validation checks file_content_contains for 'read' in deploy_env.sh
    const { completed } = await execAndValidate(
      session.id, 43,
      'cat /home/player/deploy_env.sh'
    )
    expect(completed).toBe(true)
  })

  // Level 44: 条件判断
  it('Level 44 - 条件判断: check.sh with if', async () => {
    const session = await createLevel(44)
    // Create a script that checks if app.log exists using if
    await cm.executeCommand(session.id, 'echo "#!/bin/bash" > /home/player/check.sh')
    await cm.executeCommand(session.id, 'echo "if [ -f /home/player/app.log ]; then" >> /home/player/check.sh')
    await cm.executeCommand(session.id, 'echo "  echo Log file found" >> /home/player/check.sh')
    await cm.executeCommand(session.id, 'echo "else" >> /home/player/check.sh')
    await cm.executeCommand(session.id, 'echo "  echo Log file not found" >> /home/player/check.sh')
    await cm.executeCommand(session.id, 'echo "fi" >> /home/player/check.sh')
    // Validation checks file_content_contains for 'if' in check.sh
    const { completed } = await execAndValidate(
      session.id, 44,
      'cat /home/player/check.sh'
    )
    expect(completed).toBe(true)
  })

  // Level 45: 退出码与逻辑
  it('Level 45 - 退出码与逻辑: safe_rm.sh with exit', async () => {
    const session = await createLevel(45)
    // Setup creates /home/player/testfile.tmp automatically
    // Create safe_rm.sh that checks if testfile.tmp exists, deletes it or exits with code 1
    await cm.executeCommand(session.id, 'echo "#!/bin/bash" > /home/player/safe_rm.sh')
    await cm.executeCommand(session.id, 'echo "if [ -f /home/player/testfile.tmp ]; then" >> /home/player/safe_rm.sh')
    await cm.executeCommand(session.id, 'echo "  rm /home/player/testfile.tmp" >> /home/player/safe_rm.sh')
    await cm.executeCommand(session.id, 'echo "  echo Deleted" >> /home/player/safe_rm.sh')
    await cm.executeCommand(session.id, 'echo "else" >> /home/player/safe_rm.sh')
    await cm.executeCommand(session.id, 'echo "  echo File not found" >> /home/player/safe_rm.sh')
    await cm.executeCommand(session.id, 'echo "  exit 1" >> /home/player/safe_rm.sh')
    await cm.executeCommand(session.id, 'echo "fi" >> /home/player/safe_rm.sh')
    // Validation checks file_content_contains for 'exit' in safe_rm.sh
    const { completed } = await execAndValidate(
      session.id, 45,
      'cat /home/player/safe_rm.sh'
    )
    expect(completed).toBe(true)
  })

  // Level 46: 循环遍历
  it('Level 46 - 循环遍历: disk_check.sh with for loop', async () => {
    const session = await createLevel(46)
    // Create a script that uses for loop to check disk usage of multiple dirs
    await cm.executeCommand(session.id, 'echo "#!/bin/bash" > /home/player/disk_check.sh')
    await cm.executeCommand(session.id, 'echo "for dir in /home /var /tmp; do" >> /home/player/disk_check.sh')
    await cm.executeCommand(session.id, "echo '  echo Checking $dir ... done' >> /home/player/disk_check.sh")
    await cm.executeCommand(session.id, 'echo "done" >> /home/player/disk_check.sh')
    const { output, completed } = await execAndValidate(
      session.id, 46,
      'bash /home/player/disk_check.sh'
    )
    expect(completed).toBe(true)
    expect(output).toContain('Checking /home ... done')
  })

  // Level 47: 循环读取
  it('Level 47 - 循环读取: log_stats.sh with while read', async () => {
    const session = await createLevel(47)
    // Create a script that counts lines in nginx access.log
    await cm.executeCommand(session.id, 'echo "#!/bin/bash" > /home/player/log_stats.sh')
    await cm.executeCommand(session.id, 'echo "count=0" >> /home/player/log_stats.sh')
    await cm.executeCommand(session.id, 'echo "while read line; do" >> /home/player/log_stats.sh')
    await cm.executeCommand(session.id, 'echo "  count=\$((count+1))" >> /home/player/log_stats.sh')
    await cm.executeCommand(session.id, 'echo "done < /var/log/nginx/access.log" >> /home/player/log_stats.sh')
    await cm.executeCommand(session.id, 'echo "echo Total requests: \$count" >> /home/player/log_stats.sh')
    const { output, completed } = await execAndValidate(
      session.id, 47,
      'bash /home/player/log_stats.sh'
    )
    expect(completed).toBe(true)
    expect(output).toContain('Total requests:')
  })

  // Level 48: 函数封装
  it('Level 48 - 函数封装: monitor.sh with functions', async () => {
    const session = await createLevel(48)
    // Create a script with check_service function that checks nginx and sshd
    await cm.executeCommand(session.id, 'echo "#!/bin/bash" > /home/player/monitor.sh')
    await cm.executeCommand(session.id, 'echo "check_service() {" >> /home/player/monitor.sh')
    await cm.executeCommand(session.id, "echo '  echo Checking $1... OK' >> /home/player/monitor.sh")
    await cm.executeCommand(session.id, 'echo "}" >> /home/player/monitor.sh')
    await cm.executeCommand(session.id, 'echo "check_service nginx" >> /home/player/monitor.sh')
    await cm.executeCommand(session.id, 'echo "check_service sshd" >> /home/player/monitor.sh')
    const { output, completed } = await execAndValidate(
      session.id, 48,
      'bash /home/player/monitor.sh'
    )
    expect(completed).toBe(true)
    expect(output).toContain('Checking nginx... OK')
  })

  // Level 49: 字符串处理
  it('Level 49 - 字符串处理: parse.sh extracts SERVER_NAME from app.conf', async () => {
    const session = await createLevel(49)
    // /home/player/app.conf is pre-created by Dockerfile with SERVER_NAME=production-api etc.
    // Create a script that extracts SERVER_NAME value from app.conf
    await cm.executeCommand(session.id, 'echo "#!/bin/bash" > /home/player/parse.sh')
    await cm.executeCommand(session.id, 'echo "SERVER_NAME=\$(grep SERVER_NAME /home/player/app.conf | cut -d= -f2)" >> /home/player/parse.sh')
    await cm.executeCommand(session.id, 'echo "echo Server: \$SERVER_NAME" >> /home/player/parse.sh')
    const { output, completed } = await execAndValidate(
      session.id, 49,
      'bash /home/player/parse.sh'
    )
    expect(completed).toBe(true)
    expect(output).toContain('Server:')
  })

  // Level 50: 服务器健康检查 (综合实战)
  it('Level 50 - 服务器健康检查: healthcheck.sh comprehensive script', async () => {
    const session = await createLevel(50)
    // Create a comprehensive health check script with functions
    await cm.executeCommand(session.id, 'echo "#!/bin/bash" > /home/player/healthcheck.sh')
    await cm.executeCommand(session.id, 'echo "echo Health Check Report" >> /home/player/healthcheck.sh')
    await cm.executeCommand(session.id, 'echo "echo ====================" >> /home/player/healthcheck.sh')
    await cm.executeCommand(session.id, 'echo "check_disk() {" >> /home/player/healthcheck.sh')
    await cm.executeCommand(session.id, 'echo "  df -h / | tail -1" >> /home/player/healthcheck.sh')
    await cm.executeCommand(session.id, 'echo "}" >> /home/player/healthcheck.sh')
    await cm.executeCommand(session.id, 'echo "check_memory() {" >> /home/player/healthcheck.sh')
    await cm.executeCommand(session.id, 'echo "  echo Memory: OK" >> /home/player/healthcheck.sh')
    await cm.executeCommand(session.id, 'echo "}" >> /home/player/healthcheck.sh')
    await cm.executeCommand(session.id, 'echo "check_disk" >> /home/player/healthcheck.sh')
    await cm.executeCommand(session.id, 'echo "check_memory" >> /home/player/healthcheck.sh')
    const { output, completed } = await execAndValidate(
      session.id, 50,
      'bash /home/player/healthcheck.sh'
    )
    expect(completed).toBe(true)
    expect(output).toContain('Health Check Report')
  })
})

// ============================================================
// Chapter 7: 网络排查 (Levels 51-60)
// ============================================================
describe('Chapter 7: 网络排查', () => {

  // Level 51: 网卡在哪
  it('Level 51 - 网卡在哪: ip addr', async () => {
    const session = await createLevel(51)
    const { output, completed } = await execAndValidate(session.id, 51, 'ip addr')
    expect(completed).toBe(true)
    expect(output).toContain('inet')
  })

  // Level 52: 谁在监听
  it('Level 52 - 谁在监听: ss -tlnp', async () => {
    const session = await createLevel(52)
    // nginx is pre-started by setup command
    const { output, completed } = await execAndValidate(session.id, 52, 'ss -tlnp')
    expect(completed).toBe(true)
    expect(output).toContain(':80')
  })

  // Level 53: 本地服务测试
  it('Level 53 - 本地服务测试: curl localhost', async () => {
    const session = await createLevel(53)
    const { output, completed } = await execAndValidate(session.id, 53, 'curl localhost')
    expect(completed).toBe(true)
    expect(output).toContain('html')
  })

  // Level 54: 响应头诊断
  it('Level 54 - 响应头诊断: curl -I localhost', async () => {
    const session = await createLevel(54)
    const { output, completed } = await execAndValidate(session.id, 54, 'curl -I localhost')
    expect(completed).toBe(true)
    expect(output).toContain('200')
  })

  // Level 55: 详细请求追踪
  it('Level 55 - 详细请求追踪: curl -v localhost', async () => {
    const session = await createLevel(55)
    const { output, completed } = await execAndValidate(session.id, 55, 'curl -v localhost')
    expect(completed).toBe(true)
    expect(output).toContain('HTTP/')
  })

  // Level 56: DNS 解析排查
  it('Level 56 - DNS 解析排查: nslookup localhost', async () => {
    const session = await createLevel(56)
    const { output, completed } = await execAndValidate(session.id, 56, 'nslookup localhost')
    expect(completed).toBe(true)
    expect(output).toContain('127.0.0.1')
  })

  // Level 57: 端口连通性
  it('Level 57 - 端口连通性: nc -zv localhost 80', async () => {
    const session = await createLevel(57)
    // nginx is pre-started by setup command
    const { output, completed } = await execAndValidate(session.id, 57, 'nc -zv localhost 80')
    expect(completed).toBe(true)
    expect(output).toContain('succeeded')
  })

  // Level 58: 路由走向
  it('Level 58 - 路由走向: ip route', async () => {
    const session = await createLevel(58)
    const { output, completed } = await execAndValidate(session.id, 58, 'ip route')
    expect(completed).toBe(true)
    expect(output).toContain('default')
  })

  // Level 59: 连接数统计
  it('Level 59 - 连接数统计: ss -s', async () => {
    const session = await createLevel(59)
    // nginx is pre-started by setup command
    const { output, completed } = await execAndValidate(session.id, 59, 'ss -s')
    expect(completed).toBe(true)
    expect(output).toContain('TCP')
  })

  // Level 60: 综合排查 (nginx NOT started, player must start it)
  it('Level 60 - 综合排查: start nginx + curl localhost', async () => {
    const session = await createLevel(60)
    // nginx is NOT started - player needs to start it
    await cm.executeCommand(session.id, 'nginx')
    await new Promise(r => setTimeout(r, 500))
    const { output, completed } = await execAndValidate(session.id, 60, 'curl localhost')
    expect(completed).toBe(true)
    expect(output).toContain('html')
  })
})
