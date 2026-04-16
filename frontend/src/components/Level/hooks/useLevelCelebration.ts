import { useEffect, useRef, useState } from 'react'

export function useLevelCelebration(
  completed: boolean,
  levelId: number,
  onNextLevel: () => void,
) {
  const [showFirework, setShowFirework] = useState(false)
  const prevCompletedRef = useRef(false)

  useEffect(() => {
    if (completed && !prevCompletedRef.current) {
      setShowFirework(true)
    }
    if (!completed && prevCompletedRef.current) {
      setShowFirework(false)
    }
    prevCompletedRef.current = completed
  }, [completed])

  useEffect(() => {
    setShowFirework(false)
    prevCompletedRef.current = false
  }, [levelId])

  const handleNextLevel = () => {
    setShowFirework(false)
    onNextLevel()
  }

  return {
    showFirework,
    dismissFirework: () => setShowFirework(false),
    handleNextLevel,
  }
}
