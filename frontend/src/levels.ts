export interface Level {
  id: number
  chapter: number
  title: string
  description: string
  hint: string
  command: string
  validation: {
    type: 'command' | 'output_contains' | 'file_exists' | 'file_content' | 'directory_exists' | 'file_permission' | 'directory_permission' | 'permission_exists' | 'user_exists' | 'user_in_group'
    expected: string
  }
  completed: boolean
}

export interface Progress {
  completedLevels: number[]
}
