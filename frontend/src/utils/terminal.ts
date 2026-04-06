export const HOME_DIR = '/home/player'

export function formatDir(dir: string): string {
  if (dir === HOME_DIR) return '~'
  if (dir.startsWith(HOME_DIR + '/')) return '~' + dir.slice(HOME_DIR.length)
  return dir
}
