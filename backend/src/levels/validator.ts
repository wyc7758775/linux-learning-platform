import { ContainerManager } from '../docker/containerManager.js'

interface ValidationRule {
  type: 'command' | 'output_contains' | 'output_number' | 'output_lines_gte' | 'file_exists' | 'file_content' | 'directory_exists' | 'file_permission' | 'directory_permission' | 'permission_exists' | 'user_exists' | 'user_in_group'
  expected: string
}

// Level validation rules
const LEVEL_VALIDATIONS: Record<number, ValidationRule> = {
  // Chapter 1: 基础命令
  1: { type: 'command', expected: 'ls' },
  2: { type: 'output_contains', expected: '/home/player' },
  3: { type: 'command', expected: 'cd' },
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
  output: string
): Promise<boolean> {
  const validation = LEVEL_VALIDATIONS[levelId]
  if (!validation) {
    return false
  }

  console.log(`[Validator] Level ${levelId}, type: ${validation.type}, command: ${command}`)
  switch (validation.type) {
    case 'command': {
      const cmd = command.trim()
      const expected = validation.expected
      return cmd.startsWith(expected) || cmd.includes(expected)
    }

    case 'output_contains':
      return output.includes(validation.expected)

    case 'output_number': {
      // Strip ANSI codes, trim whitespace, compare as number string
      const clean = stripAnsi(output).trim()
      const actualNum = parseInt(clean, 10)
      const expectedNum = parseInt(validation.expected, 10)
      console.log(`[Validator] output_number: actual="${clean}" (${actualNum}), expected=${expectedNum}`)
      return !isNaN(actualNum) && actualNum === expectedNum
    }

    case 'output_lines_gte': {
      // Count non-empty lines in output
      const clean = stripAnsi(output)
      const lines = clean.split('\n').filter(l => l.trim().length > 0)
      const expectedCount = parseInt(validation.expected, 10)
      console.log(`[Validator] output_lines_gte: actual=${lines.length}, expected>=${expectedCount}`)
      return lines.length >= expectedCount
    }

    case 'file_exists':
      return await containerManager.checkFileExists(sessionId, validation.expected)

    case 'directory_exists':
      return await containerManager.checkDirectoryExists(sessionId, validation.expected)

    case 'file_content': {
      const content = await containerManager.getFileContent(sessionId, validation.expected)
      return content.length > 0
    }

    case 'file_permission': {
      const [filePath, permission] = validation.expected.split(':')
      const actualPermission = await containerManager.getFilePermission(sessionId, filePath)
      return actualPermission === permission
    }

    case 'directory_permission': {
      const [dirPath, permission, group] = validation.expected.split(':')
      const actualPermission = await containerManager.getFilePermission(sessionId, dirPath)
      if (actualPermission !== permission) return false
      if (group) {
        const actualGroup = await containerManager.getFileGroup(sessionId, dirPath)
        return actualGroup === group
      }
      return true
    }

    case 'permission_exists': {
      const permission = validation.expected
      return await containerManager.checkPermissionExists(sessionId, permission)
    }

    case 'user_exists': {
      const username = validation.expected
      return await containerManager.checkUserExists(sessionId, username)
    }

    case 'user_in_group': {
      const [username, groupname] = validation.expected.split(':')
      return await containerManager.checkUserInGroup(sessionId, username, groupname)
    }

    default:
      return false
  }
}
