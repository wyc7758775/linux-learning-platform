import type { ValidationRule } from '../types.js'

export const chapter7Rules: Record<number, ValidationRule> = {
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
