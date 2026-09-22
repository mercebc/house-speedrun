import { AppShell } from '../components/AppShell'
import { StorageProvider } from '../storage/StorageProvider'
import { PhotoStorageProvider } from '../storage/PhotoStorageProvider'
import { AppRoutes } from './routes'

export function App() {
  return (
    <StorageProvider>
      <PhotoStorageProvider>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </PhotoStorageProvider>
    </StorageProvider>
  )
}
