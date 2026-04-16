import { useEffect, useState } from 'react'

export function useExpandedChapters(currentChapter?: number) {
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set([currentChapter || 1]),
  )

  useEffect(() => {
    if (currentChapter) {
      setExpandedChapters(new Set([currentChapter]))
    }
  }, [currentChapter])

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters((previous) => {
      const next = new Set(previous)
      if (next.has(chapterId)) {
        next.delete(chapterId)
      } else {
        next.add(chapterId)
      }
      return next
    })
  }

  return { expandedChapters, toggleChapter }
}
