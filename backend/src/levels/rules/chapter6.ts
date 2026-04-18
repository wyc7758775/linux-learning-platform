import type { ValidationRule } from '../types.js'

export const chapter6Rules: Record<number, ValidationRule> = {
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
}
