import { ContainerManager } from '../docker/containerManager.js'

interface ValidationRule {
  type: 'command' | 'output_contains' | 'output_number' | 'output_lines_gte' | 'file_exists' | 'file_content' | 'directory_exists' | 'file_permission' | 'directory_permission' | 'permission_exists' | 'user_exists' | 'user_in_group' | 'nginx_running' | 'env_var_set' | 'file_content_contains'
  expected: string
}

// Level validation rules
const LEVEL_VALIDATIONS: Record<number, ValidationRule> = {
  // Chapter 1: 基础命令
  1: { type: 'command', expected: 'ls' },
  2: { type: 'output_contains', expected: '/home/player' },
  3: { type: 'command', expected: 'cd_home' },
  4: { type: 'command', expected: 'clear' },
  5: { type: 'command', expected: 'history' },
  // Chapter 2: 权限实战
  6: { type: 'user_exists', expected: 'alice' },
  7: { type: 'user_in_group', expected: 'alice:developers' },
  8: { type: 'file_permission', expected: '/home/player/salary.txt:600' },
  9: { type: 'directory_permission', expected: '/home/player/project:775:developers' },
  10: { type: 'file_permission', expected: '/home/player/deploy.sh:755' },
  11: { type: 'permission_exists', expected: '750' },
  12: { type: 'directory_permission', expected: '/home/player/shared:764:developers' },
  // Chapter 3: 事故响应
  13: { type: 'output_contains', expected: 'stress-worker' },
  14: { type: 'output_contains', expected: '/var/log/nginx' },
  15: { type: 'output_contains', expected: '8080' },
  16: { type: 'output_lines_gte', expected: '40' },
  17: { type: 'output_number', expected: '312' },
  18: { type: 'output_contains', expected: '10.66.6.6' },
  19: { type: 'output_number', expected: '23' },
  20: { type: 'output_contains', expected: '182' },
  // Chapter 4: 部署上线
  21: { type: 'directory_exists', expected: '/home/player/my-app/dist' },
  22: { type: 'output_contains', expected: 'index.html' },
  23: { type: 'file_exists', expected: '/var/www/html/index.html' },
  24: { type: 'output_contains', expected: 'html' },
  25: { type: 'file_exists', expected: '/etc/nginx/http.d/myapp.conf' },
  26: { type: 'output_contains', expected: 'syntax is ok' },
  27: { type: 'nginx_running', expected: 'nginx: master' },
  28: { type: 'output_contains', expected: '<html' },
  29: { type: 'output_contains', expected: 'GET' },
  30: { type: 'output_contains', expected: 'ok' },
  // Chapter 5: DevOps 实战
  31: { type: 'output_contains', expected: 'DB_PASSWORD=mysecret123' },
  32: { type: 'file_permission', expected: '/home/player/start.sh:755' },
  33: { type: 'output_contains', expected: 'prod' },
  34: { type: 'output_contains', expected: 'backup' },
  35: { type: 'file_exists', expected: '/etc/logrotate.d/myapp' },
  36: { type: 'file_exists', expected: '/home/player/.ssh/id_ed25519.pub' },
  37: { type: 'directory_exists', expected: '/home/player/backup' },
  38: { type: 'file_exists', expected: '/home/player/myapp.service' },
  39: { type: 'output_contains', expected: 'ALARM' },
  40: { type: 'output_contains', expected: 'Build complete' },
  // Chapter 6: 脚本编程
  41: { type: 'output_contains', expected: 'System Report' },
  42: { type: 'file_content_contains', expected: '/home/player/config.sh:SERVER_IP' },
  43: { type: 'file_content_contains', expected: '/home/player/deploy_env.sh:read' },
  44: { type: 'file_content_contains', expected: '/home/player/check.sh:if' },
  45: { type: 'file_content_contains', expected: '/home/player/safe_rm.sh:exit' },
  46: { type: 'output_contains', expected: 'Checking /home ... done' },
  47: { type: 'output_contains', expected: 'Total requests:' },
  48: { type: 'output_contains', expected: 'Checking nginx... OK' },
  49: { type: 'output_contains', expected: 'Server:' },
  50: { type: 'output_contains', expected: 'Health Check Report' },
  // Chapter 7: 网络排查
  51: { type: 'output_contains', expected: 'inet' },
  52: { type: 'output_contains', expected: ':80' },
  53: { type: 'output_contains', expected: 'html' },
  54: { type: 'output_contains', expected: '200' },
  55: { type: 'output_contains', expected: 'HTTP/' },
  56: { type: 'output_contains', expected: '127.0.0.1' },
  57: { type: 'output_contains', expected: 'succeeded' },
  58: { type: 'output_contains', expected: 'default' },
  59: { type: 'output_contains', expected: 'TCP' },
  60: { type: 'output_contains', expected: 'html' },
}

// Strip ANSI escape codes from terminal output
function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*[mGKHJA-Za-z]/g, '').replace(/\r/g, '')
}

export async function validateLevel(
  containerManager: ContainerManager,
  sessionId: string,
  levelId: number,
  command: string,
  output: string,
  currentDir?: string
): Promise<{ completed: boolean; output: string }> {
  const validation = LEVEL_VALIDATIONS[levelId]
  if (!validation) {
    return { completed: false, output }
  }

  console.log(`[Validator] Level ${levelId}, type: ${validation.type}, command: ${command}`)
  let completed = false
  switch (validation.type) {
    case 'command': {
      const cmd = command.trim()
      const expected = validation.expected
      if (expected === 'cd_home') {
        // Level 3: must use cd, and end up in /home/player
        completed = /^cd(\s|$)/.test(cmd) && !!currentDir && currentDir === '/home/player'
      } else if (levelId === 5 && expected === 'history') {
        const cleanOutput = stripAnsi(output).trim()
        completed = cmd === 'history' && cleanOutput.length > 0
      } else {
        completed = cmd.startsWith(expected) || cmd.includes(expected)
      }
      break
    }

    case 'output_contains':
      completed = output.includes(validation.expected)
      break

    case 'output_number': {
      const clean = stripAnsi(output).trim()
      const actualNum = parseInt(clean, 10)
      const expectedNum = parseInt(validation.expected, 10)
      console.log(`[Validator] output_number: actual="${clean}" (${actualNum}), expected=${expectedNum}`)
      completed = !isNaN(actualNum) && actualNum === expectedNum
      break
    }

    case 'output_lines_gte': {
      const clean = stripAnsi(output)
      const lines = clean.split('\n').filter(l => l.trim().length > 0)
      const expectedCount = parseInt(validation.expected, 10)
      console.log(`[Validator] output_lines_gte: actual=${lines.length}, expected>=${expectedCount}`)
      completed = lines.length >= expectedCount
      break
    }

    case 'file_exists':
      completed = await containerManager.checkFileExists(sessionId, validation.expected)
      break

    case 'directory_exists':
      completed = await containerManager.checkDirectoryExists(sessionId, validation.expected)
      break

    case 'file_content': {
      const content = await containerManager.getFileContent(sessionId, validation.expected)
      completed = content.length > 0
      break
    }

    case 'file_permission': {
      const [filePath, permission] = validation.expected.split(':')
      const actualPermission = await containerManager.getFilePermission(sessionId, filePath)
      if (levelId === 8) {
        const cmd = command.trim()
        const history = containerManager.getCommandHistory(sessionId)
        const hasUpdatedPermission = history.some((item) => item.includes('chmod 600') && item.includes(filePath))
        const isInspectingPermission =
          cmd === `ls -l ${filePath}` ||
          cmd === `stat ${filePath}` ||
          cmd === `stat -c "%a %n" ${filePath}` ||
          cmd === `stat -c '%a %n' ${filePath}`

        completed = actualPermission === permission && hasUpdatedPermission && isInspectingPermission
      } else {
        completed = actualPermission === permission
      }
      break
    }

    case 'directory_permission': {
      const [dirPath, permission, group] = validation.expected.split(':')
      const actualPermission = await containerManager.getFilePermission(sessionId, dirPath)
      if (actualPermission !== permission) {
        completed = false
      } else if (group) {
        const actualGroup = await containerManager.getFileGroup(sessionId, dirPath)
        completed = actualGroup === group
      } else {
        completed = true
      }
      break
    }

    case 'permission_exists': {
      const permission = validation.expected
      completed = await containerManager.checkPermissionExists(sessionId, permission)
      break
    }

    case 'user_exists': {
      const username = validation.expected
      if (levelId === 6) {
        const cmd = command.trim()
        const history = containerManager.getCommandHistory(sessionId)
        const hasCreatedUser = history.some((item) => /^adduser(\s+-D)?\s+alice$/.test(item))
        const userExists = await containerManager.checkUserExists(sessionId, username)
        const isInspectingUser = /^(id|getent\s+passwd)\s+alice$/.test(cmd)

        completed = userExists && hasCreatedUser && isInspectingUser
      } else {
        completed = await containerManager.checkUserExists(sessionId, username)
      }
      break
    }

    case 'user_in_group': {
      const [username, groupname] = validation.expected.split(':')
      if (levelId === 7) {
        const cmd = command.trim()
        const history = containerManager.getCommandHistory(sessionId)
        const hasUpdatedGroup = history.some((item) => /^usermod(\s|$)/.test(item) && item.includes('-aG') && item.includes('developers') && item.includes('alice'))
        const isInspectingUser = /^(id|groups|getent\s+passwd)\s+alice$/.test(cmd)
        const userInGroup = await containerManager.checkUserInGroup(sessionId, username, groupname)

        completed = userInGroup && hasUpdatedGroup && isInspectingUser
      } else {
        completed = await containerManager.checkUserInGroup(sessionId, username, groupname)
      }
      break
    }

    case 'nginx_running': {
      const result = await containerManager.executeCommand(sessionId, 'ps aux | grep nginx')
      completed = result.output.includes(validation.expected)
      break
    }

    case 'env_var_set': {
      const envResult = await containerManager.executeCommand(sessionId, `echo \${${validation.expected}:-}`)
      completed = envResult.output.trim().length > 0
      break
    }

    case 'file_content_contains': {
      const [filePath, contentToFind] = validation.expected.split(':')
      const content = await containerManager.getFileContent(sessionId, filePath)
      completed = content.includes(contentToFind)
      break
    }

    default:
      completed = false
  }

  // Post-validation: adduser user-already-exists compensation
  if (!completed) {
    const adduserMatch = command.trim().match(/^adduser\s+(\S+)/)
    if (adduserMatch) {
      const username = adduserMatch[1]
      const userExists = await containerManager.checkUserExists(sessionId, username)
      if (userExists) {
        completed = true
        output += `\r\n\x1b[33m💡 用户 ${username} 已存在，任务目标已达成！\x1b[0m`
      }
    }
  }

  return { completed, output }
}
