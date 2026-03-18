export interface Level {
  id: number
  chapter: number
  title: string
  description: string
  hint: string
  command: string
  validation: {
    type: 'command' | 'output_contains' | 'file_exists' | 'file_content'
    expected: string
  }
  completed: boolean
}

export interface Progress {
  completedLevels: number[]
}
