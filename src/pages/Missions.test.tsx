import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Missions } from './Missions'
import { StorageProvider } from '../storage/StorageProvider'
import { createFakeStorage } from '../test/fakeStorage'
import type { Task } from '../domain/tasks/task.types'

const now = new Date('2026-09-22T09:00:00.000Z')

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    name: 'Kitchen counters',
    roomId: 'kitchen',
    frequencyDays: 1,
    estimatedSeconds: 420,
    personalBestSeconds: null,
    lastCompletedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    ...overrides,
  }
}

function renderMissions(tasks: Task[]) {
  const storage = createFakeStorage({ tasks })
  render(
    <MemoryRouter initialEntries={['/missions']}>
      <StorageProvider storage={storage}>
        <Routes>
          <Route path="/missions" element={<Missions now={now} />} />
          <Route path="/missions/run" element={<p>mission runner</p>} />
        </Routes>
      </StorageProvider>
    </MemoryRouter>,
  )
  return storage
}

describe('Missions page', () => {
  it('asks how much time you have, before showing any mission', async () => {
    renderMissions([buildTask()])

    expect(screen.getByText(/how much time do you have/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /start mission/i })).not.toBeInTheDocument()
  })

  it('builds and shows a mission once a duration is picked', async () => {
    const user = userEvent.setup()
    renderMissions([buildTask({ name: 'Kitchen counters', estimatedSeconds: 420 })])

    await user.click(screen.getByRole('button', { name: '20 min' }))

    expect(await screen.findByText('Kitchen counters')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start mission/i })).toBeInTheDocument()
  })

  it('persists the active mission and navigates to the runner when started', async () => {
    const user = userEvent.setup()
    const storage = renderMissions([buildTask({ id: 'kitchen-counters', estimatedSeconds: 420 })])
    await user.click(screen.getByRole('button', { name: '20 min' }))
    await screen.findByRole('button', { name: /start mission/i })

    await user.click(screen.getByRole('button', { name: /start mission/i }))

    expect(await screen.findByText('mission runner')).toBeInTheDocument()
    expect(await storage.getActiveMission()).toEqual({
      taskIds: ['kitchen-counters'],
      availableSeconds: 1200,
      currentIndex: 0,
    })
  })
})
