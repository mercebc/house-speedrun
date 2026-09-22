import { useMemo, type ReactNode } from 'react'
import { PhotoStorageContext } from './photoStorageContext'
import { createIndexedDbPhotoStorage } from './photoStorage'
import type { PhotoStorageService } from './photoStorage'

export function PhotoStorageProvider({
  children,
  storage,
}: {
  children: ReactNode
  storage?: PhotoStorageService
}) {
  const value = useMemo(() => storage ?? createIndexedDbPhotoStorage(), [storage])
  return <PhotoStorageContext.Provider value={value}>{children}</PhotoStorageContext.Provider>
}
