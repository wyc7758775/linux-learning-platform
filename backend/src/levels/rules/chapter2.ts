import type { ValidationRule } from '../types.js'

export const chapter2Rules: Record<number, ValidationRule> = {
  6: { type: 'user_exists', expected: 'alice' },
  7: { type: 'user_in_group', expected: 'alice:developers' },
  8: { type: 'file_permission', expected: '/home/player/salary.txt:600' },
  9: { type: 'directory_permission', expected: '/home/player/project:775:developers' },
  10: { type: 'file_permission', expected: '/home/player/deploy.sh:755' },
  11: { type: 'permission_exists', expected: '750' },
  12: { type: 'directory_permission', expected: '/home/player/shared:764:developers' },
}
