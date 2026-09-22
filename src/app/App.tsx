import { AppShell } from '../components/AppShell'
import { StorageProvider } from '../storage/StorageProvider'
import { AppRoutes } from './routes'

export function App() {
  return (
    <StorageProvider>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </StorageProvider>
  )
}
