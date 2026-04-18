export type ValidationType =
  | 'command'
  | 'output_contains'
  | 'output_number'
  | 'output_lines_gte'
  | 'file_exists'
  | 'file_content'
  | 'directory_exists'
  | 'file_permission'
  | 'directory_permission'
  | 'permission_exists'
  | 'user_exists'
  | 'user_in_group'
  | 'nginx_running'
  | 'env_var_set'
  | 'file_content_contains'

export interface ValidationRule {
  type: ValidationType
  expected: string
}

export interface ValidationContainer {
  checkDirectoryExists(sessionId: string, dirPath: string): Promise<boolean>
  checkFileExists(sessionId: string, filePath: string): Promise<boolean>
  checkPermissionExists(sessionId: string, permission: string): Promise<boolean>
  checkUserExists(sessionId: string, username: string): Promise<boolean>
  checkUserInGroup(sessionId: string, username: string, groupname: string): Promise<boolean>
  executeCommand(
    sessionId: string,
    command: string,
  ): Promise<{ output: string; currentDir: string; reconnected: boolean }>
  getCommandHistory(sessionId: string): string[]
  getFileContent(sessionId: string, filePath: string): Promise<string>
  getFileGroup(sessionId: string, filePath: string): Promise<string>
  getFilePermission(sessionId: string, filePath: string): Promise<string>
}

export interface ValidationContext {
  command: string
  currentDir?: string
  levelId: number
  output: string
  rule: ValidationRule
  sessionId: string
}
