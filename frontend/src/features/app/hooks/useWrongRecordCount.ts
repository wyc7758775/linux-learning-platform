import { useEffect, useState } from 'react'
import { wrongRecordApi } from '../../../services/api'
import type { ActiveTab, AppUser } from '../types'

export function useWrongRecordCount(user: AppUser | null, activeTab: ActiveTab) {
  const [wrongRecordCount, setWrongRecordCount] = useState(0)

  const refreshWrongRecordCount = () => {
    if (!user) {
      setWrongRecordCount(0)
      return
    }

    wrongRecordApi.getCount()
      .then((response) => {
        setWrongRecordCount(response.data.count)
      })
      .catch(() => {})
  }

  useEffect(() => {
    refreshWrongRecordCount()
  }, [activeTab, user])

  return { refreshWrongRecordCount, wrongRecordCount }
}
