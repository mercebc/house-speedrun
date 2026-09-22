import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { App } from './App'

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App routing', () => {
  it('shows the home screen at /', () => {
    renderAt('/')

    expect(screen.getByRole('heading', { name: /what are we doing/i })).toBeInTheDocument()
  })

  it('shows the missions screen at /missions', () => {
    renderAt('/missions')

    expect(screen.getByRole('heading', { name: /missions/i })).toBeInTheDocument()
  })

  it('shows the tasks screen at /tasks', () => {
    renderAt('/tasks')

    expect(screen.getByRole('heading', { name: /all tasks/i })).toBeInTheDocument()
  })

  it('shows the history screen at /history', () => {
    renderAt('/history')

    expect(screen.getByRole('heading', { name: /your runs/i })).toBeInTheDocument()
  })

  it('shows the stats screen at /stats', () => {
    renderAt('/stats')

    expect(screen.getByRole('heading', { name: /stats/i })).toBeInTheDocument()
  })

  it('shows the settings screen at /settings', () => {
    renderAt('/settings')

    expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument()
  })

  it('shows the bottom navigation with links to every main section', () => {
    renderAt('/')

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /missions/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /tasks/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /stats/i })).toBeInTheDocument()
  })
})
