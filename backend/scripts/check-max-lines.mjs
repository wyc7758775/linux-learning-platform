import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const MAX_LINES = 200
const TARGETS = ['src']

function collectFiles(relativePath) {
  const absolutePath = path.join(ROOT, relativePath)
  const stats = statSync(absolutePath)

  if (stats.isFile()) {
    return [absolutePath]
  }

  return readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) => {
    const nextPath = path.join(relativePath, entry.name)
    if (entry.isDirectory()) return collectFiles(nextPath)
    if (!entry.name.endsWith('.ts')) return []
    return [path.join(ROOT, nextPath)]
  })
}

const violations = TARGETS
  .flatMap((target) => collectFiles(target))
  .map((filePath) => ({
    filePath,
    lineCount: readFileSync(filePath, 'utf8').split('\n').length,
  }))
  .filter(({ lineCount }) => lineCount > MAX_LINES)
  .sort((left, right) => right.lineCount - left.lineCount)

if (violations.length > 0) {
  console.error(`Found ${violations.length} file(s) over ${MAX_LINES} lines:`)
  for (const violation of violations) {
    console.error(`- ${path.relative(ROOT, violation.filePath)}: ${violation.lineCount}`)
  }
  process.exit(1)
}

console.log(`All checked backend files are within ${MAX_LINES} lines.`)
