export interface ChapterConfig {
  name: string
  color: string
  icon: string
}

export const chapterConfig: Record<number, ChapterConfig> = {
  1: {
    name: '终端初识',
    color: 'from-blue-500 to-cyan-500',
    icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  2: {
    name: '权限实战',
    color: 'from-amber-500 to-orange-500',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
  3: {
    name: '事故响应',
    color: 'from-red-500 to-pink-500',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
  4: {
    name: '部署上线',
    color: 'from-green-500 to-teal-500',
    icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
  },
  5: {
    name: 'DevOps 实战',
    color: 'from-purple-500 to-violet-500',
    icon: 'M4 4v1h3a2 2 0 00-2-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8zM2 10h3a2 2 0 002 2V3a2 2 0 012-2 2zm0 0V3a2 2 0 012-2 2z',
  },
  6: {
    name: '脚本编程',
    color: 'from-rose-500 to-pink-500',
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  },
  7: {
    name: '网络排查',
    color: 'from-sky-500 to-blue-600',
    icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
  },
}

export function getChapterConfig(chapter: number): ChapterConfig {
  return (
    chapterConfig[chapter] || {
      name: '高级内容',
      color: 'from-purple-500 to-violet-500',
      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    }
  )
}
