import { formatDir } from '../../utils/terminal'

export function generatePrompt(currentDir: string): string {
  const dirDisplay = formatDir(currentDir)
  return `\x1b[1;34mplayer@linux\x1b[0m:\x1b[1;36m${dirDisplay}\x1b[0m$ `
}
