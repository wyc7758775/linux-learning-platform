export function stripAnsi(value: string): string {
  return value.replace(/\x1b\[[0-9;]*[mGKHJA-Za-z]/g, '').replace(/\r/g, '')
}
