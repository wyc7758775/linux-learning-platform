import { ContainerManager } from '../docker/containerManager.js'
import { validateLevel } from '../levels/validator.js'

export async function createSessionHandler(
  containerManager: ContainerManager,
  levelId: number
) : Promise<{ id: string; currentDir: string }> {
  const session = await containerManager.createContainer(levelId)
  return { id: session.id, currentDir: session.currentDir }
}

export async function handleTerminalInput(
  containerManager: ContainerManager,
  sessionId: string,
  command: string,
  levelId: number
): Promise<{ output: string; completed: boolean; currentDir: string }> {
  // Execute command in container
  const { output: rawOutput, currentDir } = await containerManager.executeCommand(sessionId, command)

  // Validate if level is completed
  const { completed, output } = await validateLevel(
    containerManager,
    sessionId,
    levelId,
    command,
    rawOutput,
    currentDir
  )

  return { output, completed, currentDir }
}
