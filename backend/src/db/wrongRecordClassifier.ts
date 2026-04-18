const WRONG_RECORD_ERROR_TYPES = new Set([
  'permission',
  'notfound',
  'syntax',
  'command',
  'empty',
  'logic',
])

export function isWrongRecordErrorType(value: string | null | undefined): value is string {
  return WRONG_RECORD_ERROR_TYPES.has(value || '')
}

export function classifyWrongRecordType(detail: string | null): string {
  if (!detail) {
    return 'empty'
  }

  try {
    const parsed = JSON.parse(detail) as { command?: string; output?: string }
    const command = (parsed.command || '').trim()
    const output = (parsed.output || '').trim()

    if (!command || !output) {
      return 'empty'
    }

    if (/permission denied|are you root/i.test(output)) return 'permission'
    if (/no such file|not found|cannot access/i.test(output)) return 'notfound'
    if (/syntax error/i.test(output)) return 'syntax'
    if (/command not found/i.test(output)) return 'command'

    return 'logic'
  } catch {
    return 'logic'
  }
}
