import { createContext } from 'react'
import type { Settings } from './storage'

export interface SettingsContextValue {
  settings: Settings
  // False until the real persisted settings have loaded (settings holds
  // DEFAULT_SETTINGS as a placeholder until then). Consumers that let the
  // user edit settings should wait for this before mounting form inputs,
  // so local input state can initialize from the real value directly
  // instead of needing to sync via an effect after the fact.
  isLoaded: boolean
  updateSettings: (next: Settings) => Promise<void>
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)
