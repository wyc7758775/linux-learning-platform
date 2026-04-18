import { validateCommand } from './handlers/commandValidation.js'
import { validateFileRule } from './handlers/fileValidation.js'
import { validateOutputRule } from './handlers/outputValidation.js'
import { applyAddUserCompensation, validateUserRule } from './handlers/userValidation.js'
import { LEVEL_VALIDATIONS } from './rules/index.js'
import type { ValidationContainer } from './types.js'

export async function validateLevel(
  containerManager: ValidationContainer,
  sessionId: string,
  levelId: number,
  command: string,
  output: string,
  currentDir?: string,
): Promise<{ completed: boolean; output: string }> {
  const rule = LEVEL_VALIDATIONS[levelId]
  if (!rule) return { completed: false, output }

  const context = { command, currentDir, levelId, output, rule, sessionId }
  let completed = false

  if (rule.type === 'command') {
    completed = validateCommand(context, () => containerManager.getCommandHistory(sessionId))
  } else if (['output_contains', 'output_number', 'output_lines_gte', 'nginx_running', 'env_var_set'].includes(rule.type)) {
    completed = await validateOutputRule(containerManager, context)
  } else if (['user_exists', 'user_in_group'].includes(rule.type)) {
    completed = await validateUserRule(containerManager, context)
  } else {
    completed = await validateFileRule(containerManager, context)
  }

  return applyAddUserCompensation(containerManager, sessionId, command, output, completed)
}
