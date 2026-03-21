export interface KnowledgeCard {
  command: string
  description: string
  flags?: {
    flag: string
    meaning: string
  }[]
}

export interface Level {
  id: number
  chapter: number
  title: string
  description: string
  hint: string
  command: string
  objective?: string
  knowledgeCards?: KnowledgeCard[]
  validation: {
    type: 'command' | 'output_contains' | 'output_number' | 'output_lines_gte' | 'file_exists' | 'file_content' | 'directory_exists' | 'file_permission' | 'directory_permission' | 'permission_exists' | 'user_exists' | 'user_in_group'
    expected: string
  }
  completed: boolean
}

export interface Progress {
  completedLevels: number[]
}
