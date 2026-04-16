export function hasAuthToken() {
  return Boolean(localStorage.getItem('linux-learning-token'))
}

export function readGuestProgress() {
  const currentLevel = localStorage.getItem('linux-learning-current-level')
  const savedProgress = localStorage.getItem('linux-learning-progress')

  return {
    currentLevel: currentLevel ? parseInt(currentLevel, 10) : null,
    completedLevels: savedProgress ? JSON.parse(savedProgress).completedLevels || [] : [],
  }
}

export function saveGuestCurrentLevel(currentLevel: number) {
  localStorage.setItem('linux-learning-current-level', String(currentLevel))
}

export function saveGuestProgress(currentLevel: number, completedLevels: number[]) {
  localStorage.setItem('linux-learning-current-level', String(currentLevel))
  localStorage.setItem('linux-learning-progress', JSON.stringify({ completedLevels }))
}
