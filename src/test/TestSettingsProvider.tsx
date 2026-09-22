import type { ReactNode } from 'react'
import { SettingsContext, type SettingsContextValue } from '../storage/settingsContext'
import { DEFAULT_SETTINGS, type Settings } from '../storage/storage'

export function TestSettingsProvider({
  children,
  settings = DEFAULT_SETTINGS,
  isLoaded = true,
  updateSettings = async () => {},
}: {
  children: ReactNode
  settings?: Settings
  isLoaded?: boolean
  updateSettings?: (next: Settings) => Promise<void>
}) {
  const value: SettingsContextValue = { settings, isLoaded, updateSettings }
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
