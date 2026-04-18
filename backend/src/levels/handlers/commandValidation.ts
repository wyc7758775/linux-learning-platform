import { stripAnsi } from '../helpers.js'
import type { ValidationContext } from '../types.js'

export function validateCommand(
  context: ValidationContext,
  getHistory: () => string[],
): boolean {
  const command = context.command.trim()
  const expected = context.rule.expected

  if (expected === 'cd_home') {
    return /^cd(\s|$)/.test(command) && context.currentDir === '/home/player'
  }

  if (context.levelId === 5 && expected === 'history') {
    return command === 'history' && stripAnsi(context.output).trim().length > 0
  }

  return command.startsWith(expected) || command.includes(expected)
}
