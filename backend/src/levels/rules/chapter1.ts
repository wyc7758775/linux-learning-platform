import type { ValidationRule } from '../types.js'

export const chapter1Rules: Record<number, ValidationRule> = {
  1: { type: 'command', expected: 'ls' },
  2: { type: 'output_contains', expected: '/home/player' },
  3: { type: 'command', expected: 'cd_home' },
  4: { type: 'command', expected: 'clear' },
  5: { type: 'command', expected: 'history' },
}
