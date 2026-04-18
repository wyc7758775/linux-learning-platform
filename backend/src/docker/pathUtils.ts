export function normalizePath(path: string): string {
  const parts = path.split('/').filter((part) => part && part !== '.')
  const result: string[] = []

  for (const part of parts) {
    if (part === '..') {
      result.pop()
    } else {
      result.push(part)
    }
  }

  return `/${result.join('/')}`
}

export function resolveCdTargetPath(currentDir: string, targetPath: string): string {
  if (targetPath.startsWith('/')) return normalizePath(targetPath)
  if (targetPath === '~') return '/home/player'
  if (targetPath.startsWith('~/')) return normalizePath(`/home/player/${targetPath.slice(2)}`)
  if (targetPath === '..') return normalizePath(`${currentDir}/..`)
  if (targetPath === '.') return currentDir
  return normalizePath(currentDir === '/' ? `/${targetPath}` : `${currentDir}/${targetPath}`)
}

export function resolveSessionPath(currentDir: string, targetPath: string): string {
  return normalizePath(targetPath.startsWith('/') ? targetPath : `${currentDir}/${targetPath}`)
}
