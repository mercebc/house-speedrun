import { AppShell } from '../components/AppShell'
import { StorageProvider } from '../storage/StorageProvider'
import { PhotoStorageProvider } from '../storage/PhotoStorageProvider'
import { SettingsProvider } from '../storage/SettingsProvider'
import { AppRoutes } from './routes'

export function App() {
  return (
    <StorageProvider>
      <PhotoStorageProvider>
        <SettingsProvider>
          <AppShell>
            <AppRoutes />
          </AppShell>
        </SettingsProvider>
      </PhotoStorageProvider>
    </StorageProvider>
  )
}
