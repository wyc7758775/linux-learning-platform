import type { ValidationContainer, ValidationContext } from '../types.js'

export async function validateUserRule(
  containerManager: ValidationContainer,
  context: ValidationContext,
): Promise<boolean> {
  if (context.rule.type === 'user_exists') {
    return validateUserExists(containerManager, context)
  }

  if (context.rule.type === 'user_in_group') {
    return validateUserInGroup(containerManager, context)
  }

  return false
}

async function validateUserExists(
  containerManager: ValidationContainer,
  context: ValidationContext,
): Promise<boolean> {
  const username = context.rule.expected
  const userExists = await containerManager.checkUserExists(context.sessionId, username)

  if (context.levelId !== 6) {
    return userExists
  }

  const history = containerManager.getCommandHistory(context.sessionId)
  const hasCreatedUser = history.some((item) => /^adduser(\s+-D)?\s+alice$/.test(item))
  const isInspectingUser = /^(id|getent\s+passwd)\s+alice$/.test(context.command.trim())
  return userExists && hasCreatedUser && isInspectingUser
}

async function validateUserInGroup(
  containerManager: ValidationContainer,
  context: ValidationContext,
): Promise<boolean> {
  const [username, groupname] = context.rule.expected.split(':')
  const userInGroup = await containerManager.checkUserInGroup(
    context.sessionId,
    username,
    groupname,
  )

  if (context.levelId !== 7) {
    return userInGroup
  }

  const history = containerManager.getCommandHistory(context.sessionId)
  const hasUpdatedGroup = history.some((item) =>
    /^usermod(\s|$)/.test(item)
      && item.includes('-aG')
      && item.includes('developers')
      && item.includes('alice'),
  )
  const isInspectingUser = /^(id|groups|getent\s+passwd)\s+alice$/.test(context.command.trim())
  return userInGroup && hasUpdatedGroup && isInspectingUser
}

export async function applyAddUserCompensation(
  containerManager: ValidationContainer,
  sessionId: string,
  command: string,
  output: string,
  completed: boolean,
): Promise<{ completed: boolean; output: string }> {
  if (completed) {
    return { completed, output }
  }

  const match = command.trim().match(/^adduser\s+(\S+)/)
  if (!match) {
    return { completed, output }
  }

  const username = match[1]
  if (!(await containerManager.checkUserExists(sessionId, username))) {
    return { completed, output }
  }

  return {
    completed: true,
    output: `${output}\r\n\x1b[33m💡 用户 ${username} 已存在，任务目标已达成！\x1b[0m`,
  }
}
