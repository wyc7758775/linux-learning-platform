import type { ValidationContainer, ValidationContext } from '../types.js'

export async function validateFileRule(
  containerManager: ValidationContainer,
  context: ValidationContext,
): Promise<boolean> {
  const { expected, type } = context.rule

  if (type === 'file_exists') {
    return containerManager.checkFileExists(context.sessionId, expected)
  }

  if (type === 'directory_exists') {
    return containerManager.checkDirectoryExists(context.sessionId, expected)
  }

  if (type === 'file_content') {
    const content = await containerManager.getFileContent(context.sessionId, expected)
    return content.length > 0
  }

  if (type === 'permission_exists') {
    return containerManager.checkPermissionExists(context.sessionId, expected)
  }

  if (type === 'file_content_contains') {
    const [filePath, contentToFind] = expected.split(':')
    const content = await containerManager.getFileContent(context.sessionId, filePath)
    return content.includes(contentToFind)
  }

  if (type === 'directory_permission') {
    const [dirPath, permission, group] = expected.split(':')
    const actualPermission = await containerManager.getFilePermission(context.sessionId, dirPath)
    if (actualPermission !== permission) return false
    return group
      ? (await containerManager.getFileGroup(context.sessionId, dirPath)) === group
      : true
  }

  if (type === 'file_permission') {
    return validateFilePermission(containerManager, context)
  }

  return false
}

async function validateFilePermission(
  containerManager: ValidationContainer,
  context: ValidationContext,
): Promise<boolean> {
  const [filePath, permission] = context.rule.expected.split(':')
  const actualPermission = await containerManager.getFilePermission(context.sessionId, filePath)
  if (actualPermission !== permission) return false

  if (context.levelId === 8) {
    const history = containerManager.getCommandHistory(context.sessionId)
    const isInspectingPermission = [
      `ls -l ${filePath}`,
      `stat ${filePath}`,
      `stat -c "%a %n" ${filePath}`,
      `stat -c '%a %n' ${filePath}`,
    ].includes(context.command.trim())

    return history.some((item) => item.includes('chmod 600') && item.includes(filePath))
      && isInspectingPermission
  }

  if (context.levelId === 10) {
    const history = containerManager.getCommandHistory(context.sessionId)
    const hasUpdatedPermission = history.some((item) =>
      (item.includes('chmod 755') || item.includes('chmod +x')) && item.includes(filePath),
    )
    const executedScript = ['./deploy.sh', '/home/player/deploy.sh'].includes(context.command.trim())
    const scriptSucceeded = context.output.includes('Deploying application...')
      && context.output.includes('Done!')

    return hasUpdatedPermission && executedScript && scriptSucceeded
  }

  return true
}
