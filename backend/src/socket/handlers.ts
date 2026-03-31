import { ContainerManager, ContainerSession } from '../docker/containerManager.js'
import { validateLevel } from '../levels/validator.js'

export async function createSessionHandler(
  containerManager: ContainerManager,
  levelId: number
): Promise<{ id: string }> {
  const session = await containerManager.createContainer(levelId)
  return { id: session.id }
}

export async function handleTerminalInput(
  containerManager: ContainerManager,
  sessionId: string,
  command: string,
  levelId: number
): Promise<{ output: string; completed: boolean; currentDir: string }> {
  // Execute command in container
  const { output, currentDir } = await containerManager.executeCommand(sessionId, command)

  // Validate if level is completed
  let completed = await validateLevel(
    containerManager,
    sessionId,
    levelId,
    command,
    output
  )

  // Post-validation: friendly message when adduser fails but user already exists
  let finalOutput = output
  if (!completed) {
    const adduserMatch = command.trim().match(/^adduser\s+(\S+)/)
    if (adduserMatch) {
      const username = adduserMatch[1]
      const userExists = await containerManager.checkUserExists(sessionId, username)
      if (userExists) {
        completed = true
        finalOutput += `\r\n\x1b[33m💡 用户 ${username} 已存在，任务目标已达成！\x1b[0m`
      }
    }
  }

  return { output: finalOutput, completed, currentDir }
}
