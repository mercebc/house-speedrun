import { useMemo, type ReactNode } from 'react'
import { StorageContext } from './storageContext'
import { createLocalStorageService } from './localStorage'
import type { StorageService } from './storage'

export function StorageProvider({
  children,
  storage,
}: {
  children: ReactNode
  storage?: StorageService
}) {
  const value = useMemo(() => storage ?? createLocalStorageService(), [storage])
  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
}
