import { useEffect, useState, type ReactNode } from 'react'
import { SettingsContext } from './settingsContext'
import { DEFAULT_SETTINGS, type Settings } from './storage'
import { useStorage } from './useStorage'

export function SettingsProvider({ children }: { children: ReactNode }) {
  const storage = useStorage()
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    storage.getSettings().then((loaded) => {
      setSettings(loaded)
      setIsLoaded(true)
    })
  }, [storage])

  async function updateSettings(next: Settings) {
    await storage.saveSettings(next)
    setSettings(next)
  }

  return (
    <SettingsContext.Provider value={{ settings, isLoaded, updateSettings }}>{children}</SettingsContext.Provider>
  )
}
