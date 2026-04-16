export interface TerminalProps {
  sessionId: string
  levelId: number
  initialDir: string
  onDirectoryChange?: (dir: string) => void
  onCommandResult?: (command: string, output: string, completed: boolean) => void
}

export interface TerminalOutputPayload {
  output: string
  currentDir?: string
  completed?: boolean
}

export interface TerminalErrorPayload {
  message: string
}
