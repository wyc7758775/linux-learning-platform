import { useEffect, useState } from 'react'
import { LEVELS, type Level } from '../../../data/levels'
import { userApi } from '../../../services/api'
import { readGuestProgress, saveGuestCurrentLevel } from '../storage'
import type { AppUser } from '../types'

export function useProgressSync(user: AppUser | null) {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [levels, setLevels] = useState<Level[]>(LEVELS)
  const [progressLoaded, setProgressLoaded] = useState(false)

  useEffect(() => {
    if (!user) {
      setProgressLoaded(true)
      return
    }

    userApi.getProgress()
      .then((response) => {
        const { currentLevel: savedLevel, completedLevels } = response.data
        setCurrentLevel(savedLevel)
        setLevels((previous) => previous.map((level) => ({
          ...level,
          completed: completedLevels.includes(level.id),
        })))
        setProgressLoaded(true)
      })
      .catch(() => {
        const guestProgress = readGuestProgress()
        if (guestProgress.currentLevel) {
          setCurrentLevel(guestProgress.currentLevel)
        }
        setLevels((previous) => previous.map((level) => ({
          ...level,
          completed: guestProgress.completedLevels.includes(level.id),
        })))
        setProgressLoaded(true)
      })
  }, [user])

  useEffect(() => {
    if (!progressLoaded) return

    if (user) {
      const completedLevels = levels.filter((level) => level.completed).map((level) => level.id)
      userApi.updateProgress(currentLevel, completedLevels).catch(() => {})
      return
    }

    saveGuestCurrentLevel(currentLevel)
  }, [currentLevel, progressLoaded, user])

  return { currentLevel, levels, progressLoaded, setCurrentLevel, setLevels }
}
