import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Missions } from './Missions'
import { StorageProvider } from '../storage/StorageProvider'
import { PhotoStorageProvider } from '../storage/PhotoStorageProvider'
import { createFakeStorage } from '../test/fakeStorage'
import { createFakePhotoStorage } from '../test/fakePhotoStorage'
import { TestSettingsProvider } from '../test/TestSettingsProvider'
import type { Task } from '../domain/tasks/task.types'
import type { Supply } from '../domain/supplies/supply.types'

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
    supplyIds: [],
    ...overrides,
  }
}

function renderMissions(tasks: Task[], supplies: Supply[] = []) {
  const storage = createFakeStorage({ tasks, supplies })
  render(
    <MemoryRouter initialEntries={['/missions']}>
      <StorageProvider storage={storage}>
        <TestSettingsProvider>
          <PhotoStorageProvider storage={createFakePhotoStorage()}>
            <Routes>
              <Route path="/missions" element={<Missions now={now} />} />
              <Route path="/missions/run" element={<p>mission runner</p>} />
            </Routes>
          </PhotoStorageProvider>
        </TestSettingsProvider>
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

  it('combines supplies across every task in the mission into one gather list', async () => {
    const user = userEvent.setup()
    renderMissions(
      [
        buildTask({ id: 'a', name: 'Mop floors', estimatedSeconds: 420, supplyIds: ['mop', 'bucket'] }),
        buildTask({ id: 'b', name: 'Dust living room', estimatedSeconds: 420, supplyIds: ['duster'] }),
      ],
      [
        { id: 'mop', name: 'Mop' },
        { id: 'bucket', name: 'Bucket' },
        { id: 'duster', name: 'Duster' },
      ],
    )

    await user.click(screen.getByRole('button', { name: '20 min' }))

    expect(await screen.findByText('Mop')).toBeInTheDocument()
    expect(screen.getByText('Bucket')).toBeInTheDocument()
    expect(screen.getByText('Duster')).toBeInTheDocument()
  })
})
