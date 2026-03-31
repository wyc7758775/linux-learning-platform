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
  const completed = await validateLevel(cm, sessionId, levelId, command, output)
  return { output, currentDir, completed }
}

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
