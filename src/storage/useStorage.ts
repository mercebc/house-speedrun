import { useContext } from 'react'
import { StorageContext } from './storageContext'
import type { StorageService } from './storage'

export function useStorage(): StorageService {
  const storage = useContext(StorageContext)
  if (storage === null) {
    throw new Error('useStorage must be used within a StorageProvider')
  }
  return storage
}
