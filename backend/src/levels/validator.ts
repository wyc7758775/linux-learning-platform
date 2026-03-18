import { ContainerManager } from '../docker/containerManager.js'

interface ValidationRule {
  type: 'command' | 'output_contains' | 'file_exists' | 'file_content' | 'directory_exists'
  expected: string
}

// Level validation rules
const LEVEL_VALIDATIONS: Record<number, ValidationRule> = {
  1: { type: 'command', expected: 'ls' },
  2: { type: 'output_contains', expected: '/home/player' },
  3: { type: 'command', expected: 'cd' },
  4: { type: 'command', expected: 'clear' },
  5: { type: 'command', expected: 'history' },
  6: { type: 'file_exists', expected: '/home/player/hello.txt' },
  7: { type: 'directory_exists', expected: '/home/player/projects' },
  8: { type: 'command', expected: 'rm' },
  9: { type: 'command', expected: 'rmdir' },
  10: { type: 'command', expected: 'rm -r' },
  11: { type: 'command', expected: 'cp' },
  12: { type: 'command', expected: 'mv' },
  13: { type: 'output_contains', expected: 'success' },
  14: { type: 'command', expected: 'cat' },
  15: { type: 'command', expected: 'head' },
  16: { type: 'command', expected: 'less' },
  17: { type: 'command', expected: 'nano' },
  18: { type: 'command', expected: '>' },
  19: { type: 'command', expected: '>>' },
  20: { type: 'command', expected: 'find' },
  21: { type: 'command', expected: '-type' },
  22: { type: 'command', expected: 'grep' },
  23: { type: 'command', expected: 'grep -r' },
  24: { type: 'command', expected: 'wc' },
  25: { type: 'command', expected: '|' },
  26: { type: 'command', expected: '>' },
  27: { type: 'command', expected: '>>' },
  28: { type: 'command', expected: '<' },
  29: { type: 'command', expected: '2>' },
  30: { type: 'command', expected: 'chmod' },
  31: { type: 'command', expected: 'chmod' },
  32: { type: 'command', expected: 'chown' },
  33: { type: 'command', expected: 'chgrp' },
  34: { type: 'file_exists', expected: '/home/player/backup.sh' },
  35: { type: 'command', expected: 'ps' },
  36: { type: 'command', expected: 'top' },
  37: { type: 'command', expected: 'kill' },
  38: { type: 'command', expected: '&' },
  39: { type: 'command', expected: 'curl' },
  40: { type: 'command', expected: 'ping' },
  41: { type: 'command', expected: 'df' },
  42: { type: 'command', expected: 'uname' },
  43: { type: 'file_exists', expected: '/home/player/script.sh' },
  44: { type: 'file_exists', expected: '/home/player/conditional.sh' },
  45: { type: 'file_exists', expected: '/home/player/loop.sh' },
  46: { type: 'file_exists', expected: '/home/player/function.sh' },
  47: { type: 'file_exists', expected: '/home/player/backup.sh' },
  48: { type: 'command', expected: 'sed' },
  49: { type: 'file_exists', expected: '/home/player/automate.sh' },
  50: { type: 'file_exists', expected: '/home/player/challenge.sh' },
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

  switch (validation.type) {
    case 'command':
      // Check if command was used (flexible matching)
      return command.trim().startsWith(validation.expected) ||
             command.includes(validation.expected)

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

    default:
      return false
  }
}
