import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Tasks } from './Tasks'
import { StorageProvider } from '../storage/StorageProvider'
import { PhotoStorageProvider } from '../storage/PhotoStorageProvider'
import { createFakeStorage } from '../test/fakeStorage'
import { createFakePhotoStorage } from '../test/fakePhotoStorage'
import { TestSettingsProvider } from '../test/TestSettingsProvider'
import { DEFAULT_SETTINGS, type Settings } from '../storage/storage'
import type { Room, Task } from '../domain/tasks/task.types'

const now = new Date('2026-09-22T12:00:00.000Z')

const kitchen: Room = { id: 'kitchen', name: 'Kitchen', icon: '🍳', sortOrder: 1 }
const bathroom: Room = { id: 'bathroom', name: 'Bathroom', icon: '🛁', sortOrder: 2 }

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-id',
    name: 'Task name',
    roomId: 'kitchen',
    frequencyDays: 1,
    estimatedSeconds: 300,
    personalBestSeconds: null,
    lastCompletedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    ...overrides,
  }
}

const superOverdueTask = buildTask({
  id: 'super-overdue',
  name: 'Under-stairs storage reset',
  roomId: 'kitchen',
  frequencyDays: 30,
  lastCompletedAt: '2026-07-01T00:00:00.000Z', // due 31 Jul, ~53 days overdue by 22 Sep
})
const neverDoneTask = buildTask({
  id: 'never-done',
  name: 'Pantry tidy',
  roomId: 'bathroom',
  frequencyDays: 14,
  lastCompletedAt: null,
})
const notDueTask = buildTask({
  id: 'not-due',
  name: 'Kitchen sink',
  roomId: 'kitchen',
  frequencyDays: 7,
  lastCompletedAt: '2026-09-21T00:00:00.000Z', // due 28 Sep, not due yet
})

function renderTasksPage(tasks: Task[], settings?: Settings) {
  const storage = createFakeStorage({ tasks, rooms: [kitchen, bathroom] })
  render(
    <MemoryRouter>
      <StorageProvider storage={storage}>
        <TestSettingsProvider settings={settings}>
          <PhotoStorageProvider storage={createFakePhotoStorage()}>
            <Tasks now={now} />
          </PhotoStorageProvider>
        </TestSettingsProvider>
      </StorageProvider>
    </MemoryRouter>,
  )
  return storage
}

describe('Tasks page', () => {
  it('shows every task loaded from storage', async () => {
    renderTasksPage([superOverdueTask, neverDoneTask, notDueTask])

    expect(await screen.findByText('Under-stairs storage reset')).toBeInTheDocument()
    expect(screen.getByText('Pantry tidy')).toBeInTheDocument()
    expect(screen.getByText('Kitchen sink')).toBeInTheDocument()
  })

  it('shows an empty state when there are no tasks', async () => {
    renderTasksPage([])

    expect(await screen.findByText(/no tasks match/i)).toBeInTheDocument()
  })

  it('filters to only super-overdue tasks', async () => {
    const user = userEvent.setup()
    renderTasksPage([superOverdueTask, neverDoneTask, notDueTask])
    await screen.findByText('Under-stairs storage reset')

    await user.click(screen.getByRole('button', { name: /^super overdue$/i }))

    expect(screen.getByText('Under-stairs storage reset')).toBeInTheDocument()
    expect(screen.queryByText('Pantry tidy')).not.toBeInTheDocument()
    expect(screen.queryByText('Kitchen sink')).not.toBeInTheDocument()
  })

  it('filters to only tasks with no logged completion', async () => {
    const user = userEvent.setup()
    renderTasksPage([superOverdueTask, neverDoneTask, notDueTask])
    await screen.findByText('Under-stairs storage reset')

    await user.click(screen.getByRole('button', { name: /not logged/i }))

    expect(screen.getByText('Pantry tidy')).toBeInTheDocument()
    expect(screen.queryByText('Under-stairs storage reset')).not.toBeInTheDocument()
    expect(screen.queryByText('Kitchen sink')).not.toBeInTheDocument()
  })

  it('filters by room', async () => {
    const user = userEvent.setup()
    renderTasksPage([superOverdueTask, neverDoneTask, notDueTask])
    await screen.findByText('Under-stairs storage reset')

    await user.click(screen.getByRole('button', { name: /bathroom/i }))

    expect(screen.getByText('Pantry tidy')).toBeInTheDocument()
    expect(screen.queryByText('Under-stairs storage reset')).not.toBeInTheDocument()
    expect(screen.queryByText('Kitchen sink')).not.toBeInTheDocument()
  })

  it('combines the not-logged filter with an empty result and shows the empty state', async () => {
    const user = userEvent.setup()
    renderTasksPage([notDueTask])
    await waitFor(() => expect(screen.getByRole('button', { name: /not logged/i })).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /not logged/i }))

    expect(await screen.findByText(/no tasks match/i)).toBeInTheDocument()
  })

  it('lets you log a completion that happened outside the app, updating the status immediately', async () => {
    const user = userEvent.setup()
    const storage = renderTasksPage([neverDoneTask])
    await screen.findByText('Pantry tidy')
    expect(screen.getByText('Not logged yet')).toBeInTheDocument()

    const logButtons = screen.getAllByRole('button', { name: /log it/i })
    await user.click(logButtons[0])

    await waitFor(() => expect(screen.queryByText('Not logged yet')).not.toBeInTheDocument())
    const [savedTask] = await storage.getTasks()
    expect(savedTask.lastCompletedAt).toBe(now.toISOString())
  })

  it('honours a custom super-overdue threshold from settings', async () => {
    // 5 days overdue: "Overdue" under the default 15-day threshold, but
    // "Super overdue" once the setting is lowered — proves the Settings
    // value actually reaches the rendered status, not just a hardcoded default.
    const fiveDaysOverdue = buildTask({
      id: 'five-days-overdue',
      name: 'Hob deep clean',
      frequencyDays: 7,
      lastCompletedAt: '2026-09-10T00:00:00.000Z',
    })

    renderTasksPage([fiveDaysOverdue], { ...DEFAULT_SETTINGS, superOverdueDays: 15 })
    expect(await screen.findByText('Overdue 5d')).toBeInTheDocument()

    renderTasksPage([fiveDaysOverdue], { ...DEFAULT_SETTINGS, superOverdueDays: 3 })
    expect(await screen.findByText('Super overdue 5d')).toBeInTheDocument()
  })
})
