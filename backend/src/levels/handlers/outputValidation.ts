import { stripAnsi } from '../helpers.js'
import type { ValidationContainer, ValidationContext } from '../types.js'

export async function validateOutputRule(
  containerManager: ValidationContainer,
  context: ValidationContext,
): Promise<boolean> {
  if (context.rule.type === 'output_contains') {
    return context.output.includes(context.rule.expected)
  }

  if (context.rule.type === 'output_number') {
    const actualNumber = parseInt(stripAnsi(context.output).trim(), 10)
    const expectedNumber = parseInt(context.rule.expected, 10)
    return !Number.isNaN(actualNumber) && actualNumber === expectedNumber
  }

  if (context.rule.type === 'output_lines_gte') {
    const lines = stripAnsi(context.output)
      .split('\n')
      .filter((line) => line.trim().length > 0)

    return lines.length >= parseInt(context.rule.expected, 10)
  }

  if (context.rule.type === 'nginx_running') {
    const result = await containerManager.executeCommand(
      context.sessionId,
      'ps aux | grep nginx',
    )
    return result.output.includes(context.rule.expected)
  }

  if (context.rule.type === 'env_var_set') {
    const result = await containerManager.executeCommand(
      context.sessionId,
      `echo \${${context.rule.expected}:-}`,
    )
    return result.output.trim().length > 0
  }

  return false
}
