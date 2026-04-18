export function getHistoryOutput(commandHistory: string[]): string {
  if (commandHistory.length === 0) {
    return ''
  }

  return '\r\n' + commandHistory
    .map((command, index) => `    ${index + 1}  ${command}`)
    .join('\r\n')
}
