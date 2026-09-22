import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <span className="app-shell__title">House Speedrun</span>
        <Link to="/settings" aria-label="Settings">
          ⚙
        </Link>
      </header>
      <div className="app-shell__body">
        <BottomNav />
        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  )
}
