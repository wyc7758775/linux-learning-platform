import type { ValidationRule } from '../types.js'

export const chapter5Rules: Record<number, ValidationRule> = {
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
}
