import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { TaskDetail } from './TaskDetail'
import { StorageProvider } from '../storage/StorageProvider'
import { PhotoStorageProvider } from '../storage/PhotoStorageProvider'
import { createFakeStorage } from '../test/fakeStorage'
import { createFakePhotoStorage } from '../test/fakePhotoStorage'
import { TestSettingsProvider } from '../test/TestSettingsProvider'
import { DEFAULT_SETTINGS } from '../storage/storage'
import type { Room, Task } from '../domain/tasks/task.types'
import type { Supply } from '../domain/supplies/supply.types'

const now = new Date('2026-09-22T12:00:00.000Z')

const kitchen: Room = { id: 'kitchen', name: 'Kitchen', icon: '🍳', sortOrder: 1 }
const supplies: Supply[] = [
  { id: 'oven-cleaner', name: 'Oven cleaner' },
  { id: 'rubber-gloves', name: 'Rubber gloves' },
]

const task: Task = {
  id: 'clean-oven',
  name: 'Clean oven',
  roomId: 'kitchen',
  frequencyDays: 30,
  estimatedSeconds: 1500,
  personalBestSeconds: 1230,
  lastCompletedAt: '2026-08-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  active: true,
  supplyIds: ['oven-cleaner', 'rubber-gloves'],
}

function renderAt(taskId: string, tasks: Task[] = [task], settings = DEFAULT_SETTINGS) {
  const storage = createFakeStorage({ tasks, rooms: [kitchen], supplies })
  render(
    <MemoryRouter initialEntries={[`/tasks/${taskId}`]}>
      <StorageProvider storage={storage}>
        <TestSettingsProvider settings={settings}>
          <PhotoStorageProvider storage={createFakePhotoStorage()}>
            <Routes>
              <Route path="/tasks/:taskId" element={<TaskDetail now={now} />} />
            </Routes>
          </PhotoStorageProvider>
        </TestSettingsProvider>
      </StorageProvider>
    </MemoryRouter>,
  )
  return storage
}

describe('TaskDetail', () => {
  it('shows the task name as the heading', async () => {
    renderAt('clean-oven')

    expect(await screen.findByRole('heading', { name: 'Clean oven' })).toBeInTheDocument()
  })

  it('shows the room and frequency', async () => {
    renderAt('clean-oven')

    await screen.findByRole('heading', { name: 'Clean oven' })
    expect(screen.getByText('Kitchen')).toBeInTheDocument()
    expect(screen.getByText('Every 30 days')).toBeInTheDocument()
  })

  it('shows the personal best and last completed date', async () => {
    renderAt('clean-oven')

    await screen.findByRole('heading', { name: 'Clean oven' })
    expect(screen.getByText('20:30')).toBeInTheDocument()
    expect(screen.getByText('1 Aug')).toBeInTheDocument()
  })

  it('shows the computed status', async () => {
    renderAt('clean-oven')

    expect(await screen.findByText(/overdue/i)).toBeInTheDocument()
  })

  it('shows the supplies needed for this task', async () => {
    renderAt('clean-oven')

    expect(await screen.findByText('Oven cleaner')).toBeInTheDocument()
    expect(screen.getByText('Rubber gloves')).toBeInTheDocument()
  })

  it('shows a note when the task needs no supplies', async () => {
    renderAt('clean-oven', [{ ...task, supplyIds: [] }])

    expect(await screen.findByText(/no supplies/i)).toBeInTheDocument()
  })

  it('links to the timer', async () => {
    renderAt('clean-oven')

    await screen.findByRole('heading', { name: 'Clean oven' })
    expect(screen.getByRole('link', { name: /start timer/i })).toHaveAttribute(
      'href',
      '/tasks/clean-oven/timer',
    )
  })

  it('shows a not-found message for an unknown task id', async () => {
    renderAt('does-not-exist')

    expect(await screen.findByText(/task not found/i)).toBeInTheDocument()
  })

  it('shows "Not logged yet" rather than claiming the task was never done', async () => {
    renderAt('clean-oven', [{ ...task, lastCompletedAt: null }])

    expect(await screen.findByText('Not logged yet')).toBeInTheDocument()
  })

  it('shows the estimate stat when showEstimates is enabled', async () => {
    renderAt('clean-oven', [task], { ...DEFAULT_SETTINGS, showEstimates: true })

    expect(await screen.findByText('Estimate')).toBeInTheDocument()
    expect(screen.getByText('25:00')).toBeInTheDocument()
  })

  it('hides the estimate stat when showEstimates is disabled', async () => {
    renderAt('clean-oven', [task], { ...DEFAULT_SETTINGS, showEstimates: false })

    await screen.findByRole('heading', { name: 'Clean oven' })
    expect(screen.queryByText('Estimate')).not.toBeInTheDocument()
    expect(screen.queryByText('25:00')).not.toBeInTheDocument()
  })

  it('lets you log a completion that happened outside the app', async () => {
    const user = userEvent.setup()
    const storage = renderAt('clean-oven', [{ ...task, lastCompletedAt: null }])
    await screen.findByRole('heading', { name: 'Clean oven' })

    await user.click(screen.getByRole('button', { name: /^log it$/i }))

    await waitFor(async () => {
      const [savedTask] = await storage.getTasks()
      expect(savedTask.lastCompletedAt).toBe('2026-09-22T00:00:00.000Z')
    })
    expect(screen.getByText('Today')).toBeInTheDocument()
  })
})
