import { createContext } from 'react'
import type { StorageService } from './storage'

export const StorageContext = createContext<StorageService | null>(null)
