import { ContainerManager } from '../docker/containerManager.js'

interface ValidationRule {
  type: 'command' | 'output_contains' | 'file_exists' | 'file_content' | 'directory_exists' | 'file_permission' | 'directory_permission' | 'permission_exists' | 'user_exists' | 'user_in_group'
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
  6: { type: 'user_exists', expected: 'alice' },  // 新同事入职 - 验证用户是否存在
  7: { type: 'user_in_group', expected: 'alice:developers' },  // 部门分组 - 验证用户在组中
  8: { type: 'file_permission', expected: '/home/player/salary.txt:600' },  // 机密泄露
  9: { type: 'directory_permission', expected: '/home/player/project:775:developers' },  // 协作项目
  10: { type: 'file_permission', expected: '/home/player/deploy.sh:755' },  // 脚本跑不起来
  11: { type: 'permission_exists', expected: '750' },  // 权限解密
  12: { type: 'directory_permission', expected: '/home/player/shared:764:developers' },  // 最终挑战
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
      // Check if command was used (flexible matching)
      const cmd = command.trim()
      const expected = validation.expected
      return cmd.startsWith(expected) || cmd.includes(expected)
    }

    case 'output_contains':
      return output.includes(validation.expected)

    case 'file_exists':
      return await containerManager.checkFileExists(sessionId, validation.expected)

    case 'directory_exists':
      return await containerManager.checkDirectoryExists(sessionId, validation.expected)

    case 'file_content': {
      const content = await containerManager.getFileContent(sessionId, validation.expected)
      return content.length > 0
    }

    case 'file_permission': {
      // Expected format: "/path/to/file:permission" e.g. "/home/player/salary.txt:600"
      const [filePath, permission] = validation.expected.split(':')
      const actualPermission = await containerManager.getFilePermission(sessionId, filePath)
      return actualPermission === permission
    }

    case 'directory_permission': {
      // Expected format: "/path/to/dir:permission:group" e.g. "/home/player/project:775:developers"
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
      // Check if any file with the specified permission exists
      const permission = validation.expected
      return await containerManager.checkPermissionExists(sessionId, permission)
    }

    case 'user_exists': {
      // Check if user exists in the system
      const username = validation.expected
      return await containerManager.checkUserExists(sessionId, username)
    }

    case 'user_in_group': {
      // Expected format: "username:groupname" e.g. "alice:developers"
      const [username, groupname] = validation.expected.split(':')
      return await containerManager.checkUserInGroup(sessionId, username, groupname)
    }

    default:
      return false
  }
}
