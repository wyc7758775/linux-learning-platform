import { useEffect, useState } from 'react'
import { wrongRecordApi } from '../../../services/api'
import type { WrongRecord } from '../types'

export function useWrongNotebookData() {
  const [records, setRecords] = useState<WrongRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<WrongRecord | null>(null)
  const [mobileShowDetail, setMobileShowDetail] = useState(false)

  useEffect(() => {
    wrongRecordApi.getList()
      .then((response) => {
        setRecords(response.data.records)
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (records.length > 0 && !selectedRecord) {
      setSelectedRecord(records[0])
    }
  }, [records, selectedRecord])

  const archiveRecord = async (id: number) => {
    try {
      await wrongRecordApi.archive(id)
      const remaining = records.filter((record) => record.id !== id)
      setRecords(remaining)
      if (selectedRecord?.id === id) {
        setSelectedRecord(remaining[0] || null)
      }
    } catch {
      // silently fail
    }
  }

  const openRecord = (record: WrongRecord) => {
    setSelectedRecord(record)
    setMobileShowDetail(true)
  }

  return {
    archiveRecord,
    loading,
    mobileShowDetail,
    openRecord,
    records,
    selectedRecord,
    setMobileShowDetail,
  }
}
