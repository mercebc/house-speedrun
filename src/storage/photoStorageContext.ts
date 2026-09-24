import { createContext } from 'react'
import type { PhotoStorageService } from './photoStorage'

export const PhotoStorageContext = createContext<PhotoStorageService | null>(null)
