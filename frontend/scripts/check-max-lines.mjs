import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const MAX_LINES = 200
const ROOT = process.cwd()
const TARGETS = [
  'src/App.tsx',
  'src/features/app',
  'src/components/Firework',
  'src/components/Level',
  'src/components/Progress',
  'src/components/Terminal',
  'src/components/WrongNotebook',
]

function collectFiles(targetPath) {
  const absolutePath = path.join(ROOT, targetPath)
  const stats = statSync(absolutePath)
  if (stats.isFile()) {
    return [absolutePath]
  }

  return readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) => {
    const nextPath = path.join(targetPath, entry.name)
    if (entry.isDirectory()) {
      return collectFiles(nextPath)
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) {
      return []
    }
    return [path.join(ROOT, nextPath)]
  })
}

const violations = TARGETS
  .flatMap((targetPath) => collectFiles(targetPath))
  .map((filePath) => {
    const contents = readFileSync(filePath, 'utf8')
    const lineCount = contents.split('\n').length
    return { filePath, lineCount }
  })
  .filter(({ lineCount }) => lineCount > MAX_LINES)
  .sort((left, right) => right.lineCount - left.lineCount)

if (violations.length > 0) {
  console.error(`Found ${violations.length} file(s) over ${MAX_LINES} lines:`)
  for (const violation of violations) {
    console.error(`- ${path.relative(ROOT, violation.filePath)}: ${violation.lineCount}`)
  }
  process.exit(1)
}

console.log(`All checked files are within ${MAX_LINES} lines.`)
