import { useContext } from 'react'
import { PhotoStorageContext } from './photoStorageContext'
import type { PhotoStorageService } from './photoStorage'

export function usePhotoStorage(): PhotoStorageService {
  const storage = useContext(PhotoStorageContext)
  if (storage === null) {
    throw new Error('usePhotoStorage must be used within a PhotoStorageProvider')
  }
  return storage
}
