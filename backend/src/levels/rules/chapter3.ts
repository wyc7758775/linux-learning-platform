import type { ValidationRule } from '../types.js'

export const chapter3Rules: Record<number, ValidationRule> = {
  13: { type: 'output_contains', expected: 'stress-worker' },
  14: { type: 'output_contains', expected: '/var/log/nginx' },
  15: { type: 'output_contains', expected: '8080' },
  16: { type: 'output_lines_gte', expected: '40' },
  17: { type: 'output_number', expected: '312' },
  18: { type: 'output_contains', expected: '10.66.6.6' },
  19: { type: 'output_number', expected: '23' },
  20: { type: 'output_contains', expected: '182' },
}
