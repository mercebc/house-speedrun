import { useContext } from 'react'
import { SettingsContext, type SettingsContextValue } from './settingsContext'

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext)
  if (value === null) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return value
}
